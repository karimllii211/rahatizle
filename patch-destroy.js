const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hook = `        } else if (platform === 'youtube') {`;
const insertion = `        } else if (platform === 'youtube') {
            if (window.ytPlayer && typeof window.ytPlayer.destroy === 'function') {
                window.ytPlayer.destroy();
                window.ytPlayer = null;
            }`;

js = js.replace(hook, insertion);
fs.writeFileSync('room.js', js);
console.log("Added ytPlayer.destroy()");
