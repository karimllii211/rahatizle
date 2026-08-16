const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

html = html.replace(/\s*<!-- Chat düyməsi -->/, '\n                </div>\n            </div>\n\n            <!-- Chat düyməsi -->');

fs.writeFileSync('room.html', html);
