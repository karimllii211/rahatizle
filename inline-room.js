const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

const toggleStr = `onclick="event.preventDefault(); document.getElementById('chatPanel').classList.toggle('translate-x-full');"`;
const closeStr = `onclick="event.preventDefault(); document.getElementById('chatPanel').classList.add('translate-x-full');"`;

html = html.replace(/(<button[^>]*id="toggleChatBtn"[^>]*)>/g, (match, p1) => {
    if (!p1.includes('onclick')) {
        return p1 + ` ${toggleStr}>`;
    }
    return match;
});

html = html.replace(/(<button[^>]*id="closeChatBtn"[^>]*)>/g, (match, p1) => {
    if (!p1.includes('onclick')) {
        return p1 + ` ${closeStr}>`;
    }
    return match;
});

fs.writeFileSync('room.html', html);
console.log("Updated room.html with inline onclick");
