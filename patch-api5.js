const fs = require('fs');
let content = fs.readFileSync('api/reset-password.js', 'utf8');

const regex = /function initAdmin\(\) \{[\s\S]*?return true;\s*\}/m;

const replacement = `function initAdmin() {
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
    }`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('api/reset-password.js', content);
    console.log("Patched initAdmin successfully.");
} else {
    console.log("Could not find the block to replace.");
}
