const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const anchor = '// Create Room is now handled by inline onclick in index.html';

const originalLogic = `
    // Orijinal "Otaq Yarat" Məntiqinin Bərpası
    document.body.addEventListener('click', (e) => {
        const createBtn = e.target.closest('#create-room-btn, .create-room-btn');
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

js = js.replace(anchor, originalLogic);
fs.writeFileSync('app.js', js);
console.log("Restored original logic in app.js");
