const crypto = require('crypto');
const admin = require('firebase-admin');

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

// --- Stateless OTP token -------------------------------------------------
// The server generates the code and mails it. The browser only ever holds an
// opaque token that is worthless without the code, so it cannot mint its own
// password reset. Token = base64url(payload) + "." + HMAC(secret, payload|code)
const OTP_TTL_MS = 10 * 60 * 1000;
const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payloadB64, code) {
  const secret = process.env.RESET_TOKEN_SECRET;
  return crypto.createHmac('sha256', secret).update(`${payloadB64}|${code}`).digest('base64url');
}

function issueToken(email, code) {
  const payloadB64 = b64url(JSON.stringify({ e: email, x: Date.now() + OTP_TTL_MS }));
  return `${payloadB64}.${sign(payloadB64, code)}`;
}

function verifyToken(token, code) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, mac] = token.split('.');
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.e !== 'string' || typeof payload.x !== 'number') return null;
  if (Date.now() > payload.x) return null;

  const expected = Buffer.from(sign(payloadB64, code));
  const given = Buffer.from(mac || '');
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  return payload;
}

// --- Throttling ----------------------------------------------------------
// Per-instance only (serverless), but it removes the cheap online brute force
// of the 6-digit code, which is the realistic attack on a stateless token.
const hits = new Map();
function throttle(key, limit, windowMs) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

const isEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function sendCodeEmail(email, code) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { security_code: code, email }
    })
  });
  if (!res.ok) {
    console.error('EmailJS send failed:', res.status, await res.text().catch(() => ''));
    return { ok: false, reason: 'EMAIL_SEND_FAILED' };
  }
  return { ok: true };
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
        // Surfaced to the client so it can fall back to Firebase's own reset mail.
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
