const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

// 1. Remove yt-search-results HTML from the dynamic injection
const ytSearchResultsHtml = `<div id="yt-search-results" style="position: absolute; top: 100%; left: 0; right: 0; background: #1a1a1a; max-height: 400px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: none;"></div>`;
js = js.replace(ytSearchResultsHtml, '');

// 2. Remove the dynamic ytSearchInput listener
const dynamicListenerRegex = /\/\/ Bind YouTube Search Event DƏRHAL SONRA[\s\S]*?ytSearchResults\.appendChild\(card\);\s*\}\);\s*\}\s*\n\s*\}\);\s*\}\s*catch[^\}]+\}\s*\}\s*\);\s*\}/m;
// Let's use a simpler way by finding "const ytSearchInput = document.getElementById('yt-search-input');" and deleting until the end of the block.
const blockStart = `            // Bind YouTube Search Event DƏRHAL SONRA`;
const blockEnd = `    window.onYouTubeIframeAPIReady = function() {`;

const blockStartIndex = js.indexOf(blockStart);
const blockEndIndex = js.indexOf(blockEnd);

if (blockStartIndex !== -1 && blockEndIndex !== -1 && blockStartIndex < blockEndIndex) {
    // Delete everything between these two strings (not including blockEnd)
    js = js.substring(0, blockStartIndex) + "\n" + js.substring(blockEndIndex);
    console.log("Deleted dynamic YouTube fetch block");
} else {
    console.log("Could not find dynamic YouTube fetch block correctly", blockStartIndex, blockEndIndex);
}

// 3. Find and remove the remaining initYouTubeFeature block if it exists
const initStart = `function initYouTubeFeature(mainVideo, videoPlaceholder) {`;
const initEndStr = `    window.onYouTubeIframeAPIReady = function() {`;

const iStart = js.indexOf(initStart);
if (iStart !== -1) {
    // We need to find the matching brace or just cut everything up to the next recognizable block.
    // Wait, the onYouTubeIframeAPIReady might be inside it or after it?
    // Let's just find the exact fetch URL and delete the whole function body.
    let before = js.substring(0, iStart);
    // Find the end of this function. It's right before window.onYouTubeIframeAPIReady or at the end of the file.
    let afterStart = js.indexOf(`window.onYouTubeIframeAPIReady`, iStart);
    if (afterStart !== -1) {
        js = before + js.substring(afterStart);
        console.log("Deleted dead initYouTubeFeature block");
    }
}

// 4. Also remove the call to initYouTubeFeature
js = js.replace(/initYouTubeFeature\(mainVideo, videoPlaceholder\);/g, '');

fs.writeFileSync('room.js', js);
console.log("Wiped YouTube search completely");
