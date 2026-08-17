const fs = require('fs');

// 1. Update room.html
let html = fs.readFileSync('room.html', 'utf8');
// For toggleChatBtn
html = html.replace(
    /id="toggleChatBtn" class="(.*?)" aria-label="Söhbəti aç" >/g,
    'id="toggleChatBtn" class="$1" aria-label="Söhbəti aç" onclick="event.preventDefault(); document.getElementById(\\\'chatPanel\\\').classList.toggle(\\\'translate-x-full\\\');">'
);

// For closeChatBtn
html = html.replace(
    /id="closeChatBtn" class="(.*?)" aria-label="Söhbəti bağla" >/g,
    'id="closeChatBtn" class="$1" aria-label="Söhbəti bağla" onclick="event.preventDefault(); document.getElementById(\\\'chatPanel\\\').classList.add(\\\'translate-x-full\\\');">'
);

fs.writeFileSync('room.html', html);
console.log("Updated room.html with inline onclicks");

// 2. Clean room.js
let js = fs.readFileSync('room.js', 'utf8');

// The block starts with "    // Chat Pəncərəsinin Açılma Həlli (Event Delegation ilə)"
// and ends with "});" before "// Mobil: sol panel"
const blockRegex = /\/\/ Chat Pəncərəsinin Açılma Həlli \(Event Delegation ilə\)[\s\S]*?\}\);\n/m;
js = js.replace(blockRegex, '');

fs.writeFileSync('room.js', js);
console.log("Cleaned room.js from chat event listeners");

