const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const logoHtml = `<!-- Logo -->
                <a href="index.html" class="flex items-center">
                    <img src="RahatİzleLogo2.png" alt="Rahat İzle Logo" style="height: 45px; width: auto;" class="object-contain">
                </a>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<!-- Logo -->[\s\S]*?<\/div>/, logoHtml);
    // Also handle footer or other places if it says Logo?
    // Let's just do the first occurrence which is the Navbar.
    fs.writeFileSync(file, content);
});
