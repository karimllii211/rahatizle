const fs = require('fs');

// 1. Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
// I need to change:
// <a href="#" class="create-room-btn ..."> to <a href="create-room.html" class="...">
// and remove id="create-room-btn"
html = html.replace(/id="create-room-btn" /g, '');
html = html.replace(/href="#" class="create-room-btn /g, 'href="create-room.html" class="');
html = html.replace(/class="create-room-btn /g, 'class="');

fs.writeFileSync('index.html', html);

// 2. Fix app.js (remove the rogue listener)
let js = fs.readFileSync('app.js', 'utf8');
const anchorRegex = /\/\/ Orijinal "Otaq Yarat" Məntiqinin Tam Bərpası \([\s\S]*?\}\);\s*\}\);\s*\}\);/m;

// Let's use a simpler replace by reading the string we added
const blockToRemove = `    // Orijinal "Otaq Yarat" Məntiqinin Tam Bərpası (Modal ilə)
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
    });`;

js = js.replace(blockToRemove, '');
fs.writeFileSync('app.js', js);
console.log("Restored HTML links and removed rogue JS flow");
