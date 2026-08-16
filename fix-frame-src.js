const fs = require('fs');

function updateCsp(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/frame-src ([^;]+);/, (match, p1) => {
        if (!p1.includes("'self'")) {
            return `frame-src 'self' ${p1};`;
        }
        return match;
    });
    fs.writeFileSync(file, content);
}

updateCsp('index.html');
updateCsp('room.html');
updateCsp('vercel.json');
console.log("Updated frame-src with 'self'");
