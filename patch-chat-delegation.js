const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const oldChatLogic = `    if (toggleChatBtn && chatPanel) {
        toggleChatBtn.addEventListener('click', () => {
            chatPanel.classList.toggle('translate-x-full');
        });
    }
    if (closeChatBtn && chatPanel) {
        closeChatBtn.addEventListener('click', () => {
            chatPanel.classList.add('translate-x-full');
        });
    }`;

const newChatLogic = `    // Chat açma-bağlama üçün Event Delegation
    document.addEventListener('click', (e) => {
        const chatPanelEl = document.getElementById('chatPanel');
        if (!chatPanelEl) return;
        
        // toggleChatBtn kliklənəndə
        if (e.target.closest('#toggleChatBtn')) {
            chatPanelEl.classList.toggle('translate-x-full');
        }
        
        // closeChatBtn kliklənəndə
        if (e.target.closest('#closeChatBtn')) {
            chatPanelEl.classList.add('translate-x-full');
        }
    });`;

js = js.replace(oldChatLogic, newChatLogic);
fs.writeFileSync('room.js', js);
console.log("Patched chat delegation");
