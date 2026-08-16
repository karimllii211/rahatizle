const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// Remove old youtube-player-container
html = html.replace(/<div id="youtube-player-container"[^>]*><div id="player"[^>]*><\/div><\/div>\s*/, '');

fs.writeFileSync('room.html', html);
console.log("Removed old youtube-player-container");
