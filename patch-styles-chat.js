const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// 1. Update the style block
const oldStyleBlock = /<style>[\s\S]*?<\/style>/;
const newStyleBlock = `<style>
        .room-platform-btn {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            justify-content: flex-start !important;
            padding: 10px 15px !important;
        }
        .sidebar-logo {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            object-fit: contain !important;
            margin: 0 !important;
        }
        .neon-logo { filter: drop-shadow(0 0 15px currentColor); max-width: 200px; }
        #chatPanel { z-index: 9999 !important; }
    </style>`;
html = html.replace(oldStyleBlock, newStyleBlock);

// Remove 'flex', 'items-center', 'gap-3', 'px-4', 'py-3' from room-platform-btn to let custom CSS rule override cleanly?
// Using !important is enough.

fs.writeFileSync('room.html', html);
console.log("Updated styles and z-index");
