const fs = require('fs');

const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' blob:; connect-src 'self' https://*.vercel.app https://*.firebaseapp.com https://api.emailjs.com https://*.googleapis.com https://www.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com wss://*.firebasedatabase.app https://securetoken.googleapis.com https://identitytoolkit.googleapis.com; frame-src 'self' https://rahatizle-yeni.firebaseapp.com https://accounts.google.com https://www.youtube.com;";

function updateFile(file) {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]+">/, '<meta http-equiv="Content-Security-Policy" content="' + csp + '">');
    fs.writeFileSync(file, html);
}

updateFile('index.html');
updateFile('room.html');
console.log("Updated HTML CSP");
