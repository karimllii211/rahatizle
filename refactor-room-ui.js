const fs = require('fs');

let html = fs.readFileSync('room.html', 'utf8');

// 1. Remove the old YouTube Search UI block from below the video container
// We'll replace it entirely, so we find its boundaries.
const ytUiRegex = /<!-- YouTube Search UI -->[\s\S]*?<!-- Chat düyməsi -->/;
const replacementHtml = `<!-- Chat düyməsi -->`;
html = html.replace(ytUiRegex, replacementHtml);

// 2. Refactor video-placeholder to hold the neon logos and the search UI
const oldPlaceholderRegex = /<div id="video-placeholder"[\s\S]*?<\/div>\n            <\/div>/;

// Note: the local video and YouTube player are inside `<div id="main-video-container"...>`
// Let's inspect the main video container first.
