const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const anchorStart = `    // Kənara kliklədikdə axtarış nəticələrini bağla`;
const anchorEnd = `document.addEventListener('click', closeYtSearch);`;

const sIndex = js.indexOf(anchorStart);
const eIndex = js.indexOf(anchorEnd);

if (sIndex !== -1 && eIndex !== -1) {
    js = js.substring(0, sIndex) + js.substring(eIndex + anchorEnd.length);
    fs.writeFileSync('room.js', js);
    console.log("Deleted closeYtSearch block");
}
