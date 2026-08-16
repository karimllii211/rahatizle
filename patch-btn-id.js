const fs = require('fs');

// Add ID to the main hero button in index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<a href="#" class="create-room-btn btn-press btn-glow btn-lift inline-flex w-full items-center justify-center/, '<a id="create-room-btn" href="#" class="create-room-btn btn-press btn-glow btn-lift inline-flex w-full items-center justify-center');
fs.writeFileSync('index.html', html);

// Update app.js to match either the ID or the class
let js = fs.readFileSync('app.js', 'utf8');
js = js.replace(/e\.target\.closest\('\.create-room-btn'\);/, "e.target.closest('#create-room-btn, .create-room-btn');");
fs.writeFileSync('app.js', js);

console.log("Button ID patched");
