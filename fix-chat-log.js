const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const anchor = `if (chatContainer) chatContainer.classList.toggle('translate-x-full');`;
const replacement = `if (chatContainer) {
                chatContainer.classList.toggle('translate-x-full');
                console.log('Chat açıldı (toggle)');
            }`;
            
js = js.replace(anchor, replacement);
fs.writeFileSync('room.js', js);
console.log("Added console log");
