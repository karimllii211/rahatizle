
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
    
    if (!initAdmin()) {
      return res.status(503).json({ error: 'Xidmət hazırda əlçatan deyil. Firebase məlumatları eksikdir.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    if (body.action === 'direct-reset') {
      const { email, newPassword } = body;
      // Accept passwords of length 6 or more as requested by the user frontend validation.
      if (!email || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Düzgün məlumat göndərilməyib və ya şifrə çox qısadır.' });
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
