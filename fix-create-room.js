const fs = require('fs');

let content = fs.readFileSync('create-room.html', 'utf8');

const explicitScript = `
<script>
document.addEventListener("DOMContentLoaded", () => {
    const mainCreateBtn = document.getElementById('createRoomBtn');
    const mainJoinBtn = document.getElementById('joinRoomBtn');
    const mainCodeInput = document.getElementById('roomCodeInput');

    if (mainCreateBtn) {
        mainCreateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (!user) {
                const loginModal = document.getElementById('login-modal');
                if (loginModal) { 
                    loginModal.classList.remove('hidden'); 
                    loginModal.classList.add('flex'); 
                }
                return;
            }
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
            const defaultPlatform = "netflix";
            
            mainCreateBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> YARADILIR...';
            
            firebase.database().ref('rooms/' + code + '/creator').set({
                uid: user.uid,
                name: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || \`https://ui-avatars.com/api/?name=\${user.displayName || user.email.split('@')[0]}&background=dc2626&color=fff\`,
                platform: defaultPlatform,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = \`room.html?id=\${code}&platform=\${defaultPlatform}\`;
            }).catch(error => {
                alert("Otaq yaradılarkən xəta baş verdi.");
                console.error(error);
                mainCreateBtn.innerHTML = 'YENİ OTAQ YARAT';
            });
        });
    }

    if (mainJoinBtn) {
        mainJoinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const code = mainCodeInput ? mainCodeInput.value.trim().toUpperCase() : '';
            if (!code) {
                alert("Otaq kodunu daxil edin.");
                return;
            }
            window.location.href = \`room.html?id=\${code}\`;
        });
    }
});
</script>
</body>
`;

content = content.replace('</body>', explicitScript);
fs.writeFileSync('create-room.html', content);
