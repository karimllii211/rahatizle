const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const regex = /\/\/ Chat Pəncərəsinin Açılma Həlli[\s\S]*?\}\);/m;
js = js.replace(regex, '// Chat is now handled by inline onclick in room.html');

fs.writeFileSync('room.js', js);
console.log("Cleaned room.js");
