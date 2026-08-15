const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const oldLogoHTML = /<!-- Logo -->\s*<a href="index\.html" class="flex items-center">\s*<img src="\.\/RahatİzleLogo2\.png" alt="Rahat İzle Logo" style="height: 75px; width: auto;" class="object-contain">\s*<\/a>/;

const newLogoHTML = `<!-- Logo -->
                <a href="index.html" class="flex items-center gap-3">
                    <img src="./RahatİzleLogo2.png" alt="Rahat İzle Logo" style="height: 95px; width: auto;" class="object-contain">
                    <span class="hidden md:block font-['Manrope'] font-extrabold text-3xl tracking-wider text-white">RAHAT İZLE<span class="text-[#FF014C]">.</span></span>
                </a>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.match(oldLogoHTML)) {
        content = content.replace(oldLogoHTML, newLogoHTML);
        fs.writeFileSync(file, content);
    }
});
