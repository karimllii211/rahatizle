const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// add rounded-2xl sm:rounded-3xl to video-placeholder
html = html.replace(/<div id="video-placeholder" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black transition-opacity duration-500">/, '<div id="video-placeholder" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black transition-opacity duration-500 rounded-2xl sm:rounded-3xl">');

// same for main-video and yt-player
html = html.replace(/<video id="main-video" controls muted autoplay playsinline class="relative z-20 hidden h-full w-full object-contain"><\/video>/, '<video id="main-video" controls muted autoplay playsinline class="relative z-20 hidden h-full w-full object-contain rounded-2xl sm:rounded-3xl"></video>');

html = html.replace(/<div id="youtube-player-container" class="absolute inset-0 z-20 hidden h-full w-full bg-black"><div id="player" class="h-full w-full"><\/div><\/div>/, '<div id="youtube-player-container" class="absolute inset-0 z-20 hidden h-full w-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden"><div id="player" class="h-full w-full"></div></div>');

fs.writeFileSync('room.html', html);
console.log("Fixed corners.");
