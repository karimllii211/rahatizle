const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const onclickStr = `onclick="event.preventDefault(); window.location.href = '/room.html?id=' + Math.random().toString(36).substring(2, 8).toUpperCase();"`;

// Remove the exact string and its trailing space
html = html.split(onclickStr + ' ').join('');
html = html.split(onclickStr).join('');

fs.writeFileSync('index.html', html);
console.log("Removed hardcoded onclick from index.html");
