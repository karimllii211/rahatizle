const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

js += '\n}\n';
fs.writeFileSync('room.js', js);
