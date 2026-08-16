const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

const oldRegex = /\/\/ Chat açma-bağlama üçün Event Delegation[\s\S]*?\}\);/m;

const newLogic = `
    // Chat Pəncərəsinin Açılma Həlli (Event Delegation ilə)
    document.body.addEventListener('click', (e) => {
        const chatToggle = e.target.closest('#toggleChatBtn');
        if (chatToggle) {
            e.preventDefault();
            const chatContainer = document.getElementById('chatPanel');
            if (chatContainer) {
                chatContainer.classList.toggle('translate-x-full');
            }
        }
        
        const closeChatToggle = e.target.closest('#closeChatBtn');
        if (closeChatToggle) {
            e.preventDefault();
            const chatContainer = document.getElementById('chatPanel');
            if (chatContainer) {
                chatContainer.classList.add('translate-x-full');
            }
        }
    });
`;

js = js.replace(oldRegex, newLogic);

fs.writeFileSync('room.js', js);
console.log("Patched room.js chat toggle logic");
