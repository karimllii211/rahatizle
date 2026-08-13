const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir' });
  }

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'E-poçt və ya yeni şifrə daxil edilməyib' });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });
    
    res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
  } catch (error) {
    console.error("Backend Firebase Xətası:", error);
    res.status(500).json({ error: error.message });
  }
}