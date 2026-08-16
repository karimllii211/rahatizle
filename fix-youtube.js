const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

// 1. Remove the dead initYouTubeFeature entirely
js = js.replace(/function initYouTubeFeature[\s\S]*?\}\s*window\.onYouTubeIframeAPIReady/m, 'window.onYouTubeIframeAPIReady');
js = js.replace(/initYouTubeFeature\(mainVideo, videoPlaceholder\);/g, '');

fs.writeFileSync('room.js', js);
console.log("Cleaned up dead initYouTubeFeature");
