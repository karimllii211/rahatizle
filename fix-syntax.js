const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

// The end of the file looks like:
//     // Also, we replaced document.addEventListener('click', (e) => { with this
// 
// }
// 
// 
//     }
// });

// We just need to replace that whole tail with standard closure.
const tailRegex = /\/\/ Also, we replaced document\.addEventListener\('click', \(e\) => \{ with this[\s\S]*$/;
js = js.replace(tailRegex, '// Also, we replaced document.addEventListener("click", (e) => { with this\n}\n});\n');
fs.writeFileSync('room.js', js);
