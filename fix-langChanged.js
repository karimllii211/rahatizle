const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

const oldLogic = `window.addEventListener('langChanged', () => {
    // Re-render active viewer count if possible
    if (typeof viewersRef !== 'undefined' && viewersRef) {
        viewersRef.once('value').then(snapshot => {
            const data = snapshot.val();
            const count = data ? Object.keys(data).length : 0;
            const activeViewerCount = document.getElementById('activeViewerCount');
            if (activeViewerCount) {
                activeViewerCount.textContent = \\\`\\$\\{t("active_viewers")\\}: \\$\\{count\\}\\\`;
            }
        });
    }
});`;

const newLogic = `window.addEventListener('langChanged', () => {
    const activeViewerCount = document.getElementById('activeViewerCount');
    if (activeViewerCount) {
        const countMatch = activeViewerCount.textContent.match(/\\d+/);
        const count = countMatch ? countMatch[0] : 0;
        activeViewerCount.textContent = \`\${t("active_viewers")}: \${count}\`;
    }
});`;

// We use string replacement
content = content.replace(/window\.addEventListener\('langChanged', \(\) => \{[\s\S]*?\}\);\n/m, newLogic + '\n');
fs.writeFileSync('room.js', content);
