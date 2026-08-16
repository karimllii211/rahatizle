const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

js = js.replace(/\/\/ Also, we replaced document\.addEventListener\("click", \(e\) => \{ with this\n\}\n\}\);\n/g, '');
js = js.replace(/\/\/ Also, we replaced document\.addEventListener\("click", \(e\) => \{ with this\n\}\n\n/g, '');

fs.writeFileSync('room.js', js);
