const fs = require('fs');

// The exact HTML meta tag requested by the user:
const htmlMeta = '<meta http-equiv="Content-Security-Policy" content="default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:;">';

// The exact Vercel CSP requested by the user:
const vercelCsp = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";

// 1. Update all HTML files
['index.html', 'room.html', 'create-room.html', 'contact.html', 'profile.html'].forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/g, htmlMeta);
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
                    h.value = vercelCsp;
                }
            });
        }
    });
    fs.writeFileSync('vercel.json', JSON.stringify(v, null, 2));
}

console.log("CSP relaxed globally!");
