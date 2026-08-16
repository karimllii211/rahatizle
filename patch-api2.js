const fs = require('fs');
let content = fs.readFileSync('api/reset-password.js', 'utf8');

// Replace both occurrences
content = content.replace(
  /privateKey: \(parsed\.private_key \|\| parsed\.privateKey \|\| ''\)\.replace\(\/\\\\n\/g, '\\n'\)/g,
  "privateKey: (parsed.private_key || parsed.privateKey) ? (parsed.private_key || parsed.privateKey).replace(/\\\\n/g, '\\n') : undefined"
);

content = content.replace(
  /privateKey: \(process\.env\.FIREBASE_PRIVATE_KEY \|\| ''\)\.replace\(\/\\\\n\/g, '\\n'\)/g,
  "privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n') : undefined"
);

// wait, the previous code had regex /\\n/g not /\\\\n/g in the string (it evaluated to \n)
