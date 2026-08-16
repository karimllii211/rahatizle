const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

const regex = /\/\/ Event delegation for "Create Room" buttons[\s\S]*?\}\);\s*if \(joinRoomBtn\) \{/m;

const newLogic = `
    // Event delegation for "Create Room" buttons
    document.body.addEventListener('click', (e) => {
        const createBtn = e.target.closest('#create-room-btn, .create-room-btn'); 
        if (createBtn) {
            e.preventDefault();
            
            // Qeydiyyatlıdırsa Firebase-ə yazır, deyilsə sadəcə id yaradıb yönləndirir
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            if (currentUser) {
                const defaultPlatform = "netflix";
                database.ref('rooms/' + roomId + '/creator').set({
                    uid: currentUser.uid,
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    photoURL: currentUser.photoURL || \`https://ui-avatars.com/api/?name=\${currentUser.displayName || currentUser.email.split('@')[0]}&background=dc2626&color=fff\`,
                    platform: defaultPlatform,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                }).then(() => {
                    window.location.href = \`/room.html?id=\${roomId}\`;
                }).catch(err => {
                    console.error(err);
                    window.location.href = \`/room.html?id=\${roomId}\`;
                });
            } else {
                window.location.href = \`/room.html?id=\${roomId}\`;
            }
        }
    });

    if (joinRoomBtn) {`;

js = js.replace(regex, newLogic);
fs.writeFileSync('app.js', js);
console.log("Updated app.js with requested logic");
