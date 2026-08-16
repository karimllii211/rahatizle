const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const anchor = `    if (joinRoomBtn) {`;

const originalLogic = `    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            if (!currentUser) {
                showModal(loginModal);
                return;
            }
            
            // Otaq yaratmaq üçün birbaşa yaradın, platforma seçimi room.html-də olacaq
            const roomCode = generateRoomCode();
            const defaultPlatform = "netflix"; // Default olaraq birini təyin edək
            
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
        });
    }

    if (joinRoomBtn) {`;

// Replace if it doesn't already exist
if (!js.includes('if (createRoomBtn) {')) {
    js = js.replace(anchor, originalLogic);
    fs.writeFileSync('app.js', js);
    console.log("Restored original createRoomBtn logic to app.js");
} else {
    console.log("Already present?");
}
