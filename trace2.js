const fs = require('fs');
const js = fs.readFileSync('old_room.js', 'utf8');

const start = js.indexOf('function initRoom');
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
        console.log("initRoom ends at line offset " + i);
        break;
    }
    i++;
}
