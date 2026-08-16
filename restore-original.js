const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const anchorRegex = /\/\/ Orijinal "Otaq Yarat" Məntiqinin Bərpası[\s\S]*?\}\);/m;

const originalLogicWithDelegation = `
    // Orijinal "Otaq Yarat" Məntiqinin Tam Bərpası (Modal ilə)
    document.body.addEventListener('click', (e) => {
        const createBtn = e.target.closest('#create-room-btn, .create-room-btn');
        if (createBtn) {
            e.preventDefault();
            if (!currentUser) return showToast("Əvvəlcə hesaba daxil olmalısınız!");
            
            // Otaq yaratmaq əvəzinə platforma seçimini aç
            if (typeof platformModal !== 'undefined' && platformModal) {
                showModal(platformModal);
            }
        }
    });

    // Platforma seçildikdən sonra otaq yarat və yönləndir
    document.querySelectorAll('.platform-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const selectedPlatform = btn.getAttribute('data-platform');
            const roomCode = generateRoomCode();
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || \`https://ui-avatars.com/api/?name=\${currentUser.displayName || currentUser.email.split('@')[0]}&background=dc2626&color=fff\`,
                platform: selectedPlatform,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = \`room.html?id=\${roomCode}&platform=\${selectedPlatform}\`;
            }).catch(error => {
                showToast("Otaq yaradılarkən xəta baş verdi.");
                console.error(error);
            });
        });
    });
`;

js = js.replace(anchorRegex, originalLogicWithDelegation);
fs.writeFileSync('app.js', js);
console.log("Restored original platformModal logic in app.js");
