const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Add script tag to head
if (!content.includes('i18n.js')) {
    content = content.replace('</head>', '    <script defer src="i18n.js"></script>\n</head>');
}

// Add Language Selector to Header
const langSelectorHTML = `
            <select class="lang-select rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white outline-none cursor-pointer mr-2">
                <option value="AZ" class="bg-black">AZ</option>
                <option value="TR" class="bg-black">TR</option>
                <option value="EN" class="bg-black">EN</option>
                <option value="RU" class="bg-black">RU</option>
            </select>`;

if (!content.includes('lang-select')) {
    content = content.replace(
        /<div class="flex items-center gap-3">/,
        `<div class="flex items-center gap-3">\n${langSelectorHTML}`
    );
}

fs.writeFileSync('index.html', content);
console.log("Patched index.html with i18n");
