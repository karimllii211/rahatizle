const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

js = js.replace(/window\.database/g, 'database');
js = js.replace(/window\.currentRoomId/g, 'currentRoomId');

fs.writeFileSync('room.js', js);
console.log("Fixed window scope for database and currentRoomId");
