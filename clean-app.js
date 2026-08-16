const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const regex = /\/\/ Event delegation for "Create Room" buttons[\s\S]*?\}\);/m;
js = js.replace(regex, '// Create Room is now handled by inline onclick in index.html');

fs.writeFileSync('app.js', js);
console.log("Cleaned app.js");
