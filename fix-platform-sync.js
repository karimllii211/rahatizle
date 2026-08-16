const fs = require('fs');

let js = fs.readFileSync('room.js', 'utf8');

// Inside roomRef.on('value'), we have:
// btn.classList.add('border-white/50', 'bg-white/10');
// We need to trigger the injection if it's not already injected.

const anchor = `// Platformanın dəyişməsini vizual olaraq göstərmək`;
const injectLogic = `        // Platformanın dəyişməsini vizual olaraq göstərmək
        const currentPlatform = data.creator ? data.creator.platform : null;
        if (currentPlatform && !window.initialPlatformLoaded) {
            window.initialPlatformLoaded = true;
            const targetBtn = document.querySelector(\`.platform-btn[data-platform="\${currentPlatform}"]\`);
            if (targetBtn) {
                targetBtn.click(); // Bu həm vizualı edəcək, həm də YouTube DOM-unu yaradacaq
            }
        }`;

js = js.replace(anchor, injectLogic + "\n        " + anchor);

fs.writeFileSync('room.js', js);
console.log("Fixed platform sync to inject DOM on load");
