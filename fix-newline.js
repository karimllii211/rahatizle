const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');
js = js.replace(/\\n\s*\/\//g, '\n    //');
fs.writeFileSync('room.js', js);
