const crypto = require('crypto');
const admin = require('firebase-admin');
const { OTP_TTL_MS, issueToken, verifyToken, throttle, clientIp, isEmail, sendCodeEmail } = require('./_otp');

// --- Firebase Admin (credentials come from environment, never from source) ---
function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const parsed = JSON.parse(raw);
    return {
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: (parsed.private_key || parsed.privateKey || '').replace(/\\n/g, '\n')
    };
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  };
}

function initAdmin() {
  if (admin.apps.length) return true;
  const sa = getServiceAccount();
  if (!sa.projectId || !sa.clientEmail || !sa.privateKey) return false;
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  return true;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir' });
  }
  if (!process.env.RESET_TOKEN_SECRET) {
    console.error('RESET_TOKEN_SECRET təyin edilməyib.');
    return res.status(503).json({ code: 'NOT_CONFIGURED', error: 'Xidmət hazırda əlçatan deyil.' });
  }
  if (!initAdmin()) {
    console.error('Firebase Admin məlumatları (FIREBASE_SERVICE_ACCOUNT) təyin edilməyib.');
    return res.status(503).json({ code: 'NOT_CONFIGURED', error: 'Xidmət hazırda əlçatan deyil.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const ip = clientIp(req);

  // --- Step 1: request a code -------------------------------------------
  if (body.action === 'request') {
    if (!isEmail(body.email)) {
      return res.status(400).json({ error: 'E-poçt ünvanı düzgün deyil.' });
    }
    if (!throttle(`req:${ip}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
    }

    const email = body.email.trim().toLowerCase();
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

    let userExists = true;
    try {
      await admin.auth().getUserByEmail(email);
    } catch {
      userExists = false;
    }

    if (userExists) {
      const sent = await sendCodeEmail(email, code);
      if (!sent.ok) {
        return res.status(503).json({ code: sent.reason, error: 'Kod göndərilə bilmədi.' });
      }
    }

    // Same shape either way: never reveal whether the account exists.
    return res.status(200).json({
      token: issueToken(email, userExists ? code : crypto.randomBytes(8).toString('hex')),
      message: 'Əgər bu e-poçt qeydiyyatdadırsa, təsdiq kodu göndərildi.'
    });
  }

  // --- Step 2: verify code and set the new password ----------------------
  if (body.action === 'reset') {
    const { token, code, newPassword } = body;
    if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({ error: 'Kod yanlışdır.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'Şifrə ən azı 8 simvol olmalıdır.' });
    }
    if (!throttle(`reset:${ip}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
    }

    const payload = verifyToken(token, code.trim());
    if (!payload) {
      return res.status(400).json({ error: 'Kod yanlışdır və ya vaxtı bitib.' });
    }
    // Cap guesses against one issued token, not just one IP.
    if (!throttle(`tok:${crypto.createHash('sha256').update(String(token)).digest('hex')}`, 5, OTP_TTL_MS)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Yeni kod tələb edin.' });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(payload.e);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });
      // Invalidate existing sessions so a stolen session cannot outlive the reset.
      await admin.auth().revokeRefreshTokens(userRecord.uid);
      return res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
    } catch (error) {
      console.error('Şifrə yeniləmə xətası:', error);
      return res.status(400).json({ error: 'Şifrə yenilənə bilmədi.' });
    }
  }

  return res.status(400).json({ error: 'Sorğu düzgün deyil.' });
};
