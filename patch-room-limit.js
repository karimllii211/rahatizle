const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

content = content.replace(
  /const file = e\.target\.files\[0\];\s*if \(\!file\) return;/,
  `const file = e.target.files[0];
            if (!file) return;

            // TODO: Gələcəkdə premium funksiya üçün limitin qaldırılması.
            if (file.size > 500 * 1024 * 1024) {
                showToast(i18n.getFileSizeLimit ? i18n.getFileSizeLimit() : "Faylın həcmi 500MB-dan böyük ola bilməz!");
                e.target.value = '';
                return;
            }`
);

fs.writeFileSync('room.js', content);
console.log("Patched 500MB limit");
