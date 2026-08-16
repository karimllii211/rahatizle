const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Fix duplicate class attributes
html = html.replace(/class="create-room-btn" class="([^"]+)"/g, 'href="#" class="create-room-btn $1"');

// Wait, the previous replace was:
// html = html.replace(/href="create-room.html"/g, 'href="#" class="create-room-btn"');
// So it became: <a href="#" class="create-room-btn" class="nav-link...">
// Let's just fix the double class:
html = html.replace(/href="#" class="create-room-btn" class="([^"]+)"/g, 'href="#" class="create-room-btn $1"');

fs.writeFileSync('index.html', html);
console.log("Fixed duplicate classes");
