const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

const inlineStyle = 'style="width: 24px !important; height: 24px !important; min-width: 24px !important; object-fit: contain; margin-right: 12px;"';

html = html.replace(/<img src="NetflixLogo\.webp" class="sidebar-logo">/g, '<img src="NetflixLogo.webp" class="sidebar-logo" ' + inlineStyle + '>');
html = html.replace(/<img src="YouTubeLogo\.webp" class="sidebar-logo">/g, '<img src="YouTubeLogo.webp" class="sidebar-logo" ' + inlineStyle + '>');
html = html.replace(/<img src="DisneyPlusLogo\.webp" class="sidebar-logo">/g, '<img src="DisneyPlusLogo.webp" class="sidebar-logo" ' + inlineStyle + '>');
html = html.replace(/<img src="PrimeVideologo\.svg\.webp" class="sidebar-logo">/g, '<img src="PrimeVideologo.svg.webp" class="sidebar-logo" ' + inlineStyle + '>');

fs.writeFileSync('room.html', html);
console.log("Applied inline styles to logos");
