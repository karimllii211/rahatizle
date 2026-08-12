// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdbOsVymHIPfjbw3oByjb4pS-sEB8jv8c",
  authDomain: "rahatizle-yeni.firebaseapp.com",
  projectId: "rahatizle-yeni",
  storageBucket: "rahatizle-yeni.firebasestorage.app",
  messagingSenderId: "364316761559",
  appId: "1:364316761559:web:acebb24e3012d4a0973f92",
  measurementId: "G-210JCWXKGE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();

// Google Redirect Nəticəsini yoxlama
auth.getRedirectResult().then(result => {
    if (result.user) {
        console.log("Google ilə uğurla daxil olundu:", result.user.displayName);
    }
}).catch(error => {
    alert("Google giriş xətası: " + error.message);
});

document.addEventListener('DOMContentLoaded', () => {
    // UI Panels
    const authPanel = document.getElementById('authPanel');
    const loggedInPanel = document.getElementById('loggedInPanel');
    
    // Auth Form Elements
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Profile Elements
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    // Room Form Elements
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    let currentUser = null;

    // Mərkəzi UI Nəzarəti (State Management)
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            // İstifadəçi daxil olub
            if (authPanel) authPanel.classList.add('hidden');
            if (loggedInPanel) {
                loggedInPanel.classList.remove('hidden');
                loggedInPanel.classList.add('flex');
            }
            
            // Profil məlumatlarını yenilə
            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0] || "İstifadəçi";
            }
            if (userAvatar) {
                userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=1e3a8a&color=fff`;
            }

        } else {
            // İstifadəçi çıxış edib / Daxil olmayıb
            if (authPanel) authPanel.classList.remove('hidden');
            if (loggedInPanel) {
                loggedInPanel.classList.add('hidden');
                loggedInPanel.classList.remove('flex');
            }
        }
    });

    const getCredentials = () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        return { email, password };
    };

    // 1. E-poçt və Şifrə ilə Giriş (Login)
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const { email, password } = getCredentials();
            if (!email || !password) {
                alert("Zəhmət olmasa e-poçt və şifrəni daxil edin.");
                return;
            }
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    alert("Giriş xətası: " + error.message);
                });
        });
    }

    // 2. E-poçt və Şifrə ilə Qeydiyyat (Register)
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const { email, password } = getCredentials();
            if (!email || !password) {
                alert("Zəhmət olmasa e-poçt və şifrəni daxil edin.");
                return;
            }
            
            // Şifrənin uzunluğunu yoxla
            if (password.length < 6) {
                alert("Şifrə ən azı 6 simvoldan ibarət olmalıdır!");
                return; // Firebase-ə sorğu göndərmə
            }

            auth.createUserWithEmailAndPassword(email, password)
                .catch(error => {
                    alert("Qeydiyyat xətası: " + error.message);
                });
        });
    }

    // 3. Şifrəni Sıfırlama
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            if (!email) {
                alert("Şifrəni sıfırlamaq üçün əvvəlcə yuxarıdakı xanaya e-poçt ünvanınızı yazın.");
                return;
            }
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert("Şifrə sıfırlama linki e-poçt ünvanınıza göndərildi! Zəhmət olmasa inbox-unuzu yoxlayın.");
                })
                .catch(error => {
                    alert("Sıfırlama xətası: " + error.message);
                });
        });
    }

    // 4. Google ilə Giriş (Redirect)
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithRedirect(provider);
        });
    }

    // 5. Çıxış (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(error => {
                alert("Çıxış zamanı xəta baş verdi: " + error.message);
            });
        });
    }

    // --- Otaq Məntiqi və Database ---

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert("Əvvəlcə hesaba daxil olmalısınız!");
                return;
            }

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let roomCode = '';
            for (let i = 0; i < 6; i++) {
                roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            
            // Realtime Database-ə məlumatı yaz
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=1e3a8a&color=fff`,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                // Uğurla yazıldıqdan sonra yönləndir
                window.location.href = `room.html?id=${roomCode}`;
            }).catch(error => {
                alert("Otaq yaradılarkən xəta baş verdi: " + error.message);
            });
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput.value.trim();
            if (!code) {
                alert('Zəhmət olmasa otaq kodunu daxil edin.');
                return;
            }
            window.location.href = `room.html?id=${code}`;
        });
    }
});
