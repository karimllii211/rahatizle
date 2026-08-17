const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

js = js.replace(/const currentPlatform = data\.creator \? data\.creator\.platform : null;\n        if \(currentPlatform\) {/, "if (currentPlatform) {");

fs.writeFileSync('room.js', js);
console.log("Syntax fixed");
