const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

const regex = /const response = await fetch\(`https:\/\/www\.googleapis\.com\/youtube\/v3\/search\?part=snippet\\const response = await fetch\(\`\/api\/youtube-search\?q=\$\{encodeURIComponent\(query\)\}\`\);type=video\\const response = await fetch\(\`\/api\/youtube-search\?q=\$\{encodeURIComponent\(query\)\}\`\);maxResults=20\\const response = await fetch\(\`\/api\/youtube-search\?q=\$\{encodeURIComponent\(query\)\}\`\);q=\$\{encodeURIComponent\(query\)\}\\const response = await fetch\(\`\/api\/youtube-search\?q=\$\{encodeURIComponent\(query\)\}\`\);key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s`\);/g;

content = content.replace(regex, "const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(query)}&key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s`);");

fs.writeFileSync('room.js', content);
