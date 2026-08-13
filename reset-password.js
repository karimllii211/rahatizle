const admin = require('firebase-admin');

// Firebase Admin yalnız 1 dəfə başladılmalıdır
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  // Yalnız POST sorğularını qəbul et
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Xəta: Yalnız POST qəbul edilir' });
  }

  const { email, newPassword } = req.body;

  try {
    // E-poçta görə istifadəçini tap
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Şifrəni kənardan qapalı şəkildə dəyiş
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });
    
    res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}