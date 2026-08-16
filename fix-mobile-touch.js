const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

// Fix redundant panel close logic from add-platform-logic.js
const redundantCode = `            const panel = document.getElementById('leftPanel');
            if (panel && window.innerWidth < 768) {
                panel.classList.add('-translate-x-full');
            }`;
js = js.replace(redundantCode, '');

// Ensure touch events are handled correctly on search cards
// Sometimes mobile safari needs onclick="void(0)" or similar. Adding it via setAttribute is safer.
// I will just modify the card creation to include touchstart listeners to prevent any issues.
// But mostly just making it a button or explicitly having cursor-pointer works. 
const cardCreation = `const card = document.createElement('div');
                    card.className = 'cursor-pointer group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white/10 hover:border-white/10';`;

const improvedCardCreation = `const card = document.createElement('div');
                    card.className = 'cursor-pointer group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white/10 hover:border-white/10';
                    card.setAttribute('role', 'button');
                    card.setAttribute('tabindex', '0');`;

js = js.replace(cardCreation, improvedCardCreation);

// Also make sure click events on document don't immediately close the container if we are clicking a card.
// The event target check `!container.contains(e.target)` handles it, but touch events sometimes fire differently.
// Let's add touchstart to the document listener.
const docListener = `document.addEventListener('click', (e) => {`;
const newDocListener = `const closeYtSearch = (e) => {
        const container = document.getElementById('yt-search-results-container');
        const searchInput = document.getElementById('yt-search-input');
        const searchBtn = document.getElementById('yt-search-btn');
        if (container && !container.classList.contains('hidden')) {
            if (!container.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
                container.classList.add('hidden');
            }
        }
    };
    document.addEventListener('click', closeYtSearch);
    document.addEventListener('touchstart', closeYtSearch, { passive: true });
    // Also, we replaced document.addEventListener('click', (e) => { with this
`;
js = js.replace(/document\.addEventListener\('click', \(e\) => \{[\s\S]*?\}\);/, newDocListener);

fs.writeFileSync('room.js', js);
console.log("Fixed mobile touch");
