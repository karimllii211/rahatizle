const fs = require('fs');

let html = fs.readFileSync('room.html', 'utf8');

// Replace the old sidebar-logo + inline style with sidebar-mini-icon
html = html.replace(/<img src="([^"]+)" class="sidebar-logo"[^>]+>/g, '<img src="$1" class="sidebar-mini-icon">');

// Now add the css rule to the style block
const cssRule = `
        .sidebar-mini-icon { width: 24px !important; height: 24px !important; max-width: 24px !important; min-width: 24px !important; object-fit: contain !important; display: inline-block !important; margin-right: 10px !important; }
`;

html = html.replace('</style>', cssRule + '</style>');

fs.writeFileSync('room.html', html);
console.log("Updated HTML logos with new class");
