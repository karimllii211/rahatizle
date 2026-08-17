const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const anchor = `    document.addEventListener('touchstart', closeYtSearch, { passive: true });
    
}`;

js = js.replace(anchor, "");

fs.writeFileSync('room.js', js);
console.log("Fixed dangling brace and touchstart listener");
