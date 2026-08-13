const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: "rahatizle-yeni",
      clientEmail: "firebase-adminsdk-fbsvc@rahatizle-yeni.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCRY9EILyyUQbPE\nBGoJrP0DmGm37B0rE1xoDjkegf9cxLxKpsB+kmQVwUXtF0DLsEaTDN+p59xndo5S\n1DnYR/HErJeXos8nhhBCxxp3xHFjX4RzbPoj5ZgyRxAI8a7vUdYA5/2pnYsMHBZk\nfUTv6s8jD8fWzW2u6S04+BMK9ukF65dXlWe2QBbEwtiAFFNwZQ2ipcVUO1ruIPc9\n2+7MtFgTcgxz5WNNyKt/QiyUwS7Qpy3hSS/5OzK4WizHbJ2ypfQEAbBdUz/DZCEv\notz7MdtU8vexrCLUzTgp/SVZ6N3lHDk8DnYO94G5RzL/89VPjVKlGvf76hZDKy5a\nYv16iOJ/AgMBAAECggEAJc6BAtHRk9Pp/STwtgdn29F8XDln9FWah+x66fYAA42d\nMQRftgo3QHj7yAVt8gmqsH5+gt4qMDViGSPazuUWd4AyA1pw5+QywkqoFVDd82tZ\nM/K4sTD4/MoB33GJfe4X6jBpg/vVtpZvND5m+MRkjMeDvdW5mexEuDW6LfW67rDK\nWesVlMnCUWtQ9GT6kFKC9KQZO/Y5PigoqIISff/9Z6br0pv40WE9fgCSNj8rApzG\nYa8/M/C+lmkYAANugAVd4yI1OPC0CV8h4/Hlo8VAPjbR9Mclf6XIFjjVGechULrO\nec8y5+dHQ70JN9NUDPJioSwHavlce7b33NBKooyrIQKBgQDBfiWKJqw8evytgqd3\n9djpQALXq6st9wusfrs0MovywwZzkFGctQfobGjDemIm/lRZENFWYR2XyQvh9HGv\nZO0GXxuDAT8EMoYxTx0fvvHMXGC7GGvhSXLvNYAQGUg17U1mnJ5xieSUYBwRRc92\nr6Z+TyR48y2my+C16VfY5YwjmQKBgQDAW5BCgjfX1kM7qxt0j3i3AoqvaFaniV+j\nH9OfWgmzSD5cFpBjtBd0R/cPaT6YRg3WMH4V7wCD53gi+E17hBKrXF91Bqqs6yjv\nvZ160HiZmXATJQ54TTQiQlE602LeWURVoga0aFHSDbmVUj5jm5Gh9anvzVQaToe8\nQLs8VW0F1wKBgFHyhxuXfWKwA8vIhfy8Vn2S6qFEx17UPlFz6v0UW0kZZ+YRvT7N\nPOgm4cfIUUGKfVarVL1srAfY0fuEd5F9ARWtug0lvfadH1BK3V7Qk7+lcCJNGYN0\nhATjd7VZv8d3FUzcEA6uA+0DN1/pXRA7HBxqkFvZQgBeYHEqvlXSAiQhAoGBAKCS\nztX2Rg+S+QTyTTT8H1UGdib+/ndUodVWWB4J11cl04ij/Vx9laan/IGM5YfP0vUd\n/eLpZJC3xP3MMUIOelc6ASV7rzYyCDY5HyDKriHqiDgzEuUx7Xc7zPtCQqJB+l1R\nqC8pdkPW2TjhMtuLngKJRJa93JspOv3XO3WeCih5AoGAD3+RKI15ceXl+kb6e4Vh\niAg3OaCGLM6gAueZ8FQdKAukR9pbFNCATKT2YjSAd+4ZV9Z0gQhDpZOq8OXekDBa\nZbE91AQeiYR2dRIfCCfp3sAoywMfULXmydz9xFjxmRN1QabdHs34KPcsr5PxNmuK\nlbxTDWwX9sStFSzCOQ2NeJo=\n-----END PRIVATE KEY-----\n"
    }),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir' });
  }

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'E-poçt və ya yeni şifrə daxil edilməyib' });
  }

  try {
    const userRecord = await getAuth().getUserByEmail(email);
    
    await getAuth().updateUser(userRecord.uid, {
      password: newPassword,
    });
    
    res.status(200).json({ message: 'Şifrə uğurla yeniləndi!' });
  } catch (error) {
    console.error("Backend Firebase Xətası:", error);
    res.status(500).json({ error: error.message });
  }
};