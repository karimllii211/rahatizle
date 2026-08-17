const fs = require('fs');

const files = ['index.html', 'room.html', 'create-room.html', 'contact.html', 'profile.html'];
const newMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">';

files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<meta name="viewport"[^>]*>/, newMeta);
    fs.writeFileSync(file, html);
});
console.log("Updated viewport meta tags");
