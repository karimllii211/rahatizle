const fs = require('fs');

// 1. Remove inline onclick from room.html
let html = fs.readFileSync('room.html', 'utf8');
html = html.replace(/onclick="event\.preventDefault\(\); document\.getElementById\('chatPanel'\)\.classList\.toggle\('translate-x-full'\);"/g, '');
html = html.replace(/onclick="event\.preventDefault\(\); document\.getElementById\('chatPanel'\)\.classList\.add\('translate-x-full'\);"/g, '');
fs.writeFileSync('room.html', html);

// 2. Add event delegation to room.js
let js = fs.readFileSync('room.js', 'utf8');
const chatLogic = `
    // Chat Pəncərəsinin Açılma Həlli (Event Delegation ilə)
    document.body.addEventListener('click', (e) => {
        const chatToggle = e.target.closest('#toggleChatBtn');
        if (chatToggle) {
            e.preventDefault();
            const chatContainer = document.getElementById('chatPanel');
            if (chatContainer) chatContainer.classList.toggle('translate-x-full');
        }
        
        const closeChatBtn = e.target.closest('#closeChatBtn');
        if (closeChatBtn) {
            e.preventDefault();
            const chatContainer = document.getElementById('chatPanel');
            if (chatContainer) chatContainer.classList.add('translate-x-full');
        }
    });
`;

// Insert after existing constants
if (!js.includes('Chat Pəncərəsinin Açılma Həlli')) {
    const hook = "const chatPanel = document.getElementById('chatPanel');";
    js = js.replace(hook, hook + "\\n" + chatLogic);
    fs.writeFileSync('room.js', js);
    console.log("Patched room.js chat logic");
} else {
    console.log("Chat logic already in room.js?");
}

