const fs = require('fs');
let content = fs.readFileSync('api/reset-password.js', 'utf8');

const regex = /function getServiceAccount\(\) \{[\s\S]*?return \{\s*projectId: process\.env\.FIREBASE_PROJECT_ID,[\s\S]*?\};\s*\}/m;

const replacement = `function getServiceAccount() {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          projectId: parsed.project_id || parsed.projectId,
          clientEmail: parsed.client_email || parsed.clientEmail,
          privateKey: (parsed.private_key || parsed.privateKey) ? (parsed.private_key || parsed.privateKey).replace(/\\\\n/g, '\\n') : undefined
        };
      }
      return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n') : undefined
      };
    }`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('api/reset-password.js', content);
    console.log("Patched getServiceAccount");
} else {
    console.log("Could not find getServiceAccount");
}
