const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

js = js.replace(/if \(window\.ytPlayerContainer\) window\.ytPlayerContainer\.classList\.add\('hidden'\);/g, "const ytPlayerContainer = document.getElementById('youtube-player-container');\n        if (ytPlayerContainer) ytPlayerContainer.classList.add('hidden');");

fs.writeFileSync('room.js', js);
