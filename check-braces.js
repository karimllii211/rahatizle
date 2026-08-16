const fs = require('fs');
const js = fs.readFileSync('room.js', 'utf8');

let count = 0;
let lineNum = 1;
for(let i = 0; i < js.length; i++) {
    if(js[i] === '\n') lineNum++;
    if(js[i] === '{') count++;
    if(js[i] === '}') {
        count--;
        if(count < 0) {
            console.log("Extra } at line " + lineNum);
            count = 0; // reset to find others
        }
    }
}
console.log("Final balance: " + count);
