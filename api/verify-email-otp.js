const crypto = require('crypto');
const { OTP_TTL_MS, issueToken, verifyToken, throttle, clientIp, isEmail, sendCodeEmail } = require('./_otp');

// Confirms the user controls a NEW email address before they switch to it.
// This endpoint never touches Firebase Auth — it only attests that the code
// was correct. The actual `currentUser.updateEmail(...)` call happens
// client-side with the user's already-authenticated Firebase session, which
// an attacker can't forge just by knowing a verify response.
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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const ip = clientIp(req);

  // --- Step 1: send a code to the new email address ---------------------
  if (body.action === 'request') {
    if (!isEmail(body.newEmail)) {
      return res.status(400).json({ error: 'E-poçt ünvanı düzgün deyil.' });
    }
    if (!throttle(`email-req:${ip}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
    }

    const newEmail = body.newEmail.trim().toLowerCase();
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

    const sent = await sendCodeEmail(newEmail, code);
    if (!sent.ok) {
      return res.status(503).json({ code: sent.reason, error: 'Kod göndərilə bilmədi.' });
    }

    return res.status(200).json({
      token: issueToken(newEmail, code),
      message: '6 rəqəmli təsdiq kodu göndərildi.'
    });
  }

  // --- Step 2: verify the code -------------------------------------------
  if (body.action === 'verify') {
    const { token, code } = body;
    if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
      return res.status(400).json({ error: 'Kod yanlışdır.' });
    }
    if (!throttle(`email-verify:${ip}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
    }

    const payload = verifyToken(token, code.trim());
    if (!payload) {
      return res.status(400).json({ error: 'Kod yanlışdır və ya vaxtı bitib.' });
    }
    // Cap guesses against one issued token, not just one IP.
    if (!throttle(`email-tok:${crypto.createHash('sha256').update(String(token)).digest('hex')}`, 5, OTP_TTL_MS)) {
      return res.status(429).json({ error: 'Çox sayda cəhd. Yeni kod tələb edin.' });
    }

    return res.status(200).json({ verified: true });
  }

  return res.status(400).json({ error: 'Sorğu düzgün deyil.' });
};
