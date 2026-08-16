const fs = require('fs');

const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.firebaseio.com https://*.googleapis.com https://www.gstatic.com https://www.youtube.com https://s.ytimg.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.firebaseapp.com https://*.firebasedatabase.app wss://*.firebasedatabase.app https://api.emailjs.com https://*.vercel.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; media-src 'self' blob:; frame-src 'self' https://www.youtube.com https://rahatizle-yeni.firebaseapp.com https://accounts.google.com;";

// 1. Update HTML files
['index.html', 'room.html', 'create-room.html', 'contact.html', 'profile.html'].forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/g, '<meta http-equiv="Content-Security-Policy" content="' + csp + '">');
        fs.writeFileSync(file, html);
    }
});

// 2. Update vercel.json
if (fs.existsSync('vercel.json')) {
    let v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    v.headers.forEach(hGroup => {
        if (hGroup.headers) {
            hGroup.headers.forEach(h => {
                if (h.key === "Content-Security-Policy") {
                    h.value = csp;
                }
            });
        }
    });
    fs.writeFileSync('vercel.json', JSON.stringify(v, null, 2));
}

console.log("Ultimate CSP injected globally!");
