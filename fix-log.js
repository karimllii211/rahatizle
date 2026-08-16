const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');
js = js.replace("console.log('Chat açıldı (toggle)');", "console.log('Chat açıldı');");
fs.writeFileSync('room.js', js);
