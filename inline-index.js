const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The onclick string
const onclickStr = `onclick="event.preventDefault(); window.location.href = '/room.html?id=' + Math.random().toString(36).substring(2, 8).toUpperCase();"`;

// Replace href="#" class="create-room-btn..." with the onclick added
// Be careful not to add it multiple times if I run it twice, but I'll replace href="#"
html = html.replace(/href="#"(\s+class="[^"]*create-room-btn[^"]*")/g, `href="#" ${onclickStr}$1`);
// Also for the one with id="create-room-btn" if it didn't match the above exactly
html = html.replace(/id="create-room-btn" href="#"/g, `id="create-room-btn" href="#" ${onclickStr}`);

// Wait, the first regex might catch the one with ID if it's ordered differently.
// Let's just do a safer replace: find class="create-room-btn" and inject it if not exists
html = html.replace(/(<a[^>]*class="[^"]*create-room-btn[^"]*"[^>]*)>/gi, (match, p1) => {
    if (!p1.includes('onclick')) {
        return p1 + ` ${onclickStr}>`;
    }
    return match;
});

// For the hero button, it has id="create-room-btn"
html = html.replace(/(<a[^>]*id="create-room-btn"[^>]*)>/gi, (match, p1) => {
    if (!p1.includes('onclick')) {
        return p1 + ` ${onclickStr}>`;
    }
    return match;
});

fs.writeFileSync('index.html', html);
console.log("Updated index.html with inline onclick");
