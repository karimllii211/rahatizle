const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

const buggyCode = `const { videoId, title, channelTitle, thumbnail } = item;
                    if (!videoId) return;`;

const fixedCode = `const videoId = item.id ? item.id.videoId : null;
                    const snippet = item.snippet || {};
                    const title = snippet.title || 'Adsız Video';
                    const channelTitle = snippet.channelTitle || 'Bilinməyən Kanal';
                    const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '';

                    if (!videoId) return;`;

js = js.replace(buggyCode, fixedCode);
fs.writeFileSync('room.js', js);
console.log("Fixed API parsing.");
