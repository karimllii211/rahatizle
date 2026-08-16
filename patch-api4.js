const fs = require('fs');
let content = fs.readFileSync('api/reset-password.js', 'utf8');

const regex = /function getServiceAccount\(\) \{[\s\S]*?function initAdmin\(\) \{[\s\S]*?return true;\s*\}/m;

const replacement = `function initAdmin() {
      if (admin.apps.length) return true;
      
      let formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (formattedPrivateKey) {
        // Həm \\n simvollarını əsl yeni sətirə çevirir, həm də yanlışlıqla düşmüş dırnaq işarələrini silir
        formattedPrivateKey = formattedPrivateKey.replace(/\\\\n/g, '\\n').replace(/"/g, '');
      }

      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !formattedPrivateKey) {
        return false;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formattedPrivateKey
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL // Əgər istifadə olunursa
      });
      return true;
    }`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('api/reset-password.js', content);
    console.log("Patched initAdmin successfully.");
} else {
    console.log("Could not find the block to replace.");
}
