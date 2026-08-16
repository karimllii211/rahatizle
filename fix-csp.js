const fs = require('fs');

const csp = "default-src 'self' * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' * wss: https:; img-src 'self' * data: blob:; frame-src 'self' *; style-src 'self' * 'unsafe-inline'; font-src 'self' * data:;";

let v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
v.headers.forEach(hGroup => {
    hGroup.headers.forEach(h => {
        if (h.key === "Content-Security-Policy") {
            h.value = csp;
        }
    });
});
fs.writeFileSync('vercel.json', JSON.stringify(v, null, 2));

['index.html', 'room.html', 'create-room.html'].forEach(f => {
    if(fs.existsSync(f)) {
        let html = fs.readFileSync(f, 'utf8');
        html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`);
        fs.writeFileSync(f, html);
    }
});
console.log("Fixed CSP");
