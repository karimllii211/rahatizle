const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/href="#" href="#"/g, 'href="#"');
fs.writeFileSync('index.html', html);
console.log("Fixed double href");
