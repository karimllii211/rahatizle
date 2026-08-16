const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// I'll just remove the duplicate </div></div> that I appended.
html = html.replace(/<\/div>\n            <\/div>\n\n                    <!-- Chat düyməsi -->/g, '\n                    <!-- Chat düyməsi -->');

fs.writeFileSync('room.html', html);
