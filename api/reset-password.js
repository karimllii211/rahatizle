const admin = require('firebase-admin');

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
  if (!initAdmin()) {
    console.error('Firebase Admin məlumatları təyin edilməyib.');
    return res.status(503).json({ error: 'Xidmət hazırda əlçatan deyil.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  if (body.action === 'direct-reset') {
    const { email, newPassword } = body;
    if (!email || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Düzgün məlumat göndərilməyib.' });
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });
      await admin.auth().revokeRefreshTokens(userRecord.uid);
      return res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
    } catch (error) {
      console.error('Şifrə yeniləmə xətası:', error);
      return res.status(400).json({ error: 'Şifrə yenilənə bilmədi.' });
    }
  }

  return res.status(400).json({ error: 'Sorğu düzgün deyil.' });
};
