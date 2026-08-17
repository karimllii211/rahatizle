const fs = require('fs');
const js = fs.readFileSync('old_room.js', 'utf8');

const start = js.indexOf('function initYouTubeFeature');
let depth = 0;
let started = false;
let lines = js.substring(start).split('\n');
let i = 0;
for (const line of lines) {
    for(let c of line) {
        if (c === '{') { started = true; depth++; }
        if (c === '}') depth--;
    }
    if (started && depth === 0) {
        console.log("Ends at line offset " + i);
        console.log("Line content: " + line);
        break;
    }
    i++;
}
