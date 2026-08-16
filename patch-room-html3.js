const fs = require('fs');
let content = fs.readFileSync('room.html', 'utf8');

// Add script tag to head
if (!content.includes('i18n.js')) {
    content = content.replace('</head>', '    <script defer src="i18n.js"></script>\n</head>');
}

// Add Language Selector to Header
const langSelectorHTML = `
                <select class="lang-select rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white outline-none cursor-pointer">
                    <option value="AZ" class="bg-black">AZ</option>
                    <option value="TR" class="bg-black">TR</option>
                    <option value="EN" class="bg-black">EN</option>
                    <option value="RU" class="bg-black">RU</option>
                </select>`;

content = content.replace(
    /<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">/,
    `<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">\n${langSelectorHTML}`
);

// Add data-i18n to buttons
content = content.replace(/VİDEONU BAĞLA/g, '<span data-i18n="close_video">VİDEONU BAĞLA</span>');
content = content.replace(/Çıx/g, '<span data-i18n="leave_room">Çıx</span>');
content = content.replace(/Otağı Sil/g, '<span data-i18n="delete_room">Otağı Sil</span>');
content = content.replace(/VİDEO EKRANI/g, '<span data-i18n="video_screen">VİDEO EKRANI</span>');
content = content.replace(/Canlı Chat/g, '<span data-i18n="chat_title">Canlı Chat</span>');

// Replace YouTube input placeholder
content = content.replace(/placeholder="YouTube-da video və ya mahnı axtarın..."/g, 'placeholder="YouTube-da video və ya mahnı axtarın..." data-i18n-placeholder="yt_search_placeholder"');
// Replace Chat input placeholder
content = content.replace(/placeholder="Mesaj yaz..."/g, 'placeholder="Mesaj yaz..." data-i18n-placeholder="chat_placeholder"');

// Replace YouTube search button
content = content.replace(/<button type="button" id="yt-search-btn"([^>]*)>Axtar<\/button>/g, '<button type="button" id="yt-search-btn"$1 data-i18n="yt_search_btn">Axtar</button>');

fs.writeFileSync('room.html', content);
console.log("Patched room.html with i18n");
