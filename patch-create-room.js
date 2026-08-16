const fs = require('fs');

// --- 1. Patch app.js ---
let js = fs.readFileSync('app.js', 'utf8');

// Replace the old createRoomBtn logic
const oldLogicStart = `    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {`;
const oldLogicEnd = `        });
    }`;

// We will just use regex to replace the block
const jsRegex = /if \(createRoomBtn\) \{\s*createRoomBtn\.addEventListener\('click', \(\) => \{\s*if \(!currentUser\) \{\s*showModal\(loginModal\);\s*return;\s*\}\s*\/\/[^`]*?window\.location\.href = `room\.html\?id=\$\{roomCode\}&platform=\$\{defaultPlatform\}`;[\s\S]*?\}\);\s*\}/;

const newLogic = `
    // Event delegation for "Create Room" buttons
    document.addEventListener('click', (e) => {
        const createBtn = e.target.closest('.create-room-btn');
        if (createBtn) {
            e.preventDefault();
            if (!currentUser) {
                showModal(loginModal);
                return;
            }
            const roomCode = generateRoomCode();
            const defaultPlatform = "netflix"; // Default
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || \`https://ui-avatars.com/api/?name=\${currentUser.displayName || currentUser.email.split('@')[0]}&background=dc2626&color=fff\`,
                platform: defaultPlatform,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = \`room.html?id=\${roomCode}&platform=\${defaultPlatform}\`;
            }).catch(error => {
                showToast("Otaq yaradılarkən xəta baş verdi.");
                console.error(error);
            });
        }
    });
`;

js = js.replace(jsRegex, newLogic);
fs.writeFileSync('app.js', js);


// --- 2. Patch index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Replace all links to create-room.html with # and class create-room-btn
html = html.replace(/href="create-room.html"/g, 'href="#" class="create-room-btn"');

fs.writeFileSync('index.html', html);

console.log("Patched create room logic");
