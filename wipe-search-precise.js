const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

// 1. Remove the yt-search-results div
const ytSearchResultsHtml = `<div id="yt-search-results" style="position: absolute; top: 100%; left: 0; right: 0; background: #1a1a1a; max-height: 400px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: none;"></div>`;
js = js.replace(ytSearchResultsHtml, '');

// 2. Remove the Bind YouTube Search Event DƏRHAL SONRA block
const blockStart = `            // Bind YouTube Search Event DƏRHAL SONRA`;
const blockEnd = `            } else {
                console.error("YouTube DOM elementləri tapılmadı!");
            }`;

const blockStartIndex = js.indexOf(blockStart);
const blockEndIndex = js.indexOf(blockEnd);

if (blockStartIndex !== -1 && blockEndIndex !== -1 && blockStartIndex < blockEndIndex) {
    // Delete everything between these two strings INCLUDING blockEnd
    js = js.substring(0, blockStartIndex) + js.substring(blockEndIndex + blockEnd.length);
    console.log("Deleted dynamic YouTube fetch block");
} else {
    console.log("Could not find dynamic YouTube fetch block correctly", blockStartIndex, blockEndIndex);
}

fs.writeFileSync('room.js', js);
console.log("Wiped YouTube search completely");
