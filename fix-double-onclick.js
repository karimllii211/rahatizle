const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const onclickStr = `onclick="event.preventDefault(); window.location.href = '/room.html?id=' + Math.random().toString(36).substring(2, 8).toUpperCase();"`;
html = html.replace(new RegExp(onclickStr.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&') + ' ' + onclickStr.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), onclickStr);

fs.writeFileSync('index.html', html);
console.log("Fixed double onclick");
