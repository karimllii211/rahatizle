const crypto = require('crypto');
const { OTP_TTL_MS, issueToken, verifyToken, throttle, clientIp, isEmail, sendCodeEmail } = require('./_otp');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const admin = require('firebase-admin');

    function initAdmin() {
      if (!admin.apps.length) {
        try {
          // Vercel-dəki bütöv JSON faylını oxuyuruq, bu format xətasını sıfıra endirir
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL // Ehtiyac varsa saxla
          });
        } catch (error) {
          console.error("Firebase Admin Inisializasiya Xetasi (JSON Parse Error):", error);
          return false;
        }
      }
      return true;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const ip = clientIp(req);

    // --- Addım 1: şifrə bərpası kodunu yaradıb e-poçtla göndər -------------
    // Kod və ona uyğun imzalı token yalnız serverdə yaranır; brauzer heç vaxt
    // xam kodu görmür, ona görə özü şifrə sıfırlama tokeni "düzəldə" bilməz.
    if (body.action === 'request-code') {
      if (!isEmail(body.email)) {
        return res.status(400).json({ error: 'E-poçt ünvanı düzgün deyil.' });
      }
      if (!process.env.RESET_TOKEN_SECRET) {
        console.error('RESET_TOKEN_SECRET təyin edilməyib.');
        return res.status(503).json({ error: 'Xidmət hazırda əlçatan deyil.' });
      }
      if (!throttle(`pwreset-req:${ip}`, 5, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
      }

      const email = body.email.trim().toLowerCase();
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

      const sent = await sendCodeEmail(email, code);
      if (!sent.ok) {
        return res.status(503).json({ code: sent.reason, error: 'Kod göndərilə bilmədi.' });
      }

      return res.status(200).json({
        token: issueToken(email, code),
        message: '6 rəqəmli kod göndərildi.'
      });
    }

    // --- Addım 2: kodu/tokeni doğrulayıb şifrəni dəyiş ----------------------
    if (body.action === 'direct-reset') {
      const { email, newPassword, token, code } = body;

      if (!email || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Düzgün məlumat göndərilməyib və ya şifrə çox qısadır.' });
      }
      if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Kod yanlışdır.' });
      }
      if (!throttle(`pwreset-verify:${ip}`, 10, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
      }

      const payload = verifyToken(token, code.trim());
      if (!payload || payload.e !== email.trim().toLowerCase()) {
        return res.status(400).json({ error: 'Kod yanlışdır və ya vaxtı bitib.' });
      }
      // Bir tokenə qarşı cəhdləri də məhdudlaşdırırıq, təkcə IP-yə görə yox.
      if (!throttle(`pwreset-tok:${crypto.createHash('sha256').update(String(token)).digest('hex')}`, 5, OTP_TTL_MS)) {
        return res.status(429).json({ error: 'Çox sayda cəhd. Yeni kod tələb edin.' });
      }

      if (!initAdmin()) {
        return res.status(503).json({ error: 'Xidmət hazırda əlçatan deyil. Firebase məlumatları eksikdir.' });
      }

      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });

      // Optionally revoke refresh tokens. If it fails, don't crash.
      try {
        await admin.auth().revokeRefreshTokens(userRecord.uid);
      } catch (e) {
        console.warn("Could not revoke refresh tokens:", e);
      }

      return res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
    }

    return res.status(400).json({ error: 'Sorğu düzgün deyil.' });
  } catch (error) {
    console.error('SERVER ERROR IN /api/reset-password:', error);
    return res.status(500).json({
        error: 'Daxili server xətası baş verdi.',
        details: error.message,
        stack: error.stack
    });
  }
};
