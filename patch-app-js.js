const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

const hookStart = '    if (createRoomBtn) {';
const hookEnd = '    if (joinRoomBtn) {';

const idxStart = js.indexOf(hookStart);
const idxEnd = js.indexOf(hookEnd);

if (idxStart !== -1 && idxEnd !== -1) {
    const oldBlock = js.substring(idxStart, idxEnd);
    const newBlock = `
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
    js = js.substring(0, idxStart) + newBlock + js.substring(idxEnd);
    fs.writeFileSync('app.js', js);
    console.log("Patched app.js successfully");
} else {
    console.log("Could not find blocks");
}

