const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const oldCode = `        const ytPlayerContainer = document.getElementById('youtube-player-container');

        if (mainVideo) mainVideo.classList.add('hidden');
        if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
        if (ytPlayerContainer) ytPlayerContainer.classList.remove('hidden');`;

const newCode = `        if (mainVideo) mainVideo.classList.add('hidden');
        // Ensure videoPlaceholder is visible because #player is inside it
        if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
        const playerDiv = document.getElementById('player');
        if (playerDiv) playerDiv.style.display = 'block';`;

js = js.replace(oldCode, newCode);
fs.writeFileSync('room.js', js);
console.log("Patched initOrLoadYouTubePlayer");
