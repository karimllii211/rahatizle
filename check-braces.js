const fs = require('fs');
const js = fs.readFileSync('old_room.js', 'utf8');

let depth = 0;
let lines = js.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore simple comments
    if (line.trim().startsWith('//')) continue;
    // VERY rough check
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') depth++;
        if (line[j] === '}') depth--;
    }
    if (depth < 0) {
        console.log("Unbalanced '}' at line " + (i+1));
        break;
    }
}
console.log("Final depth: " + depth);
