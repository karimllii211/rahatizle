const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const regex = /showToast\(data\.error \|\| "Şifrə yenilənə bilmədi\."\);/g;
const replacement = `showToast(data.error || "Şifrə yenilənə bilmədi.");
                    if (data.details) console.error("Backend Xətası:", data.details);`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('app.js', content);
    console.log("Patched app.js with logging.");
} else {
    console.log("Could not find the match in app.js.");
}
