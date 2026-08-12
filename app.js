// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSkoM3kNsaNmxg4I8o7uILmCVb7WSCd7E",
  authDomain: "rahatizle-4141.firebaseapp.com",
  projectId: "rahatizle-4141",
  storageBucket: "rahatizle-4141.firebasestorage.app",
  messagingSenderId: "426556860257",
  appId: "1:426556860257:web:864e23a4195959637ac720",
  measurementId: "G-W5RD8YW7NW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    // UI Panels
    const authPanel = document.getElementById('authPanel');
    const roomPanel = document.getElementById('roomPanel');
    
    // Auth Form Elements
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Room Form Elements
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    // Mərkəzi UI Nəzarəti (State Management)
    auth.onAuthStateChanged(user => {
        if (user) {
            // İstifadəçi daxil olub
            if (authPanel) authPanel.classList.add('hidden');
            if (roomPanel) roomPanel.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            // İstifadəçi çıxış edib / Daxil olmayıb
            if (authPanel) authPanel.classList.remove('hidden');
            if (roomPanel) roomPanel.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
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

    // 4. Google ilə Giriş
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider).catch(error => {
                alert("Google giriş xətası: " + error.message);
            });
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

    // --- Otaq Məntiqi ---

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let roomCode = '';
            for (let i = 0; i < 6; i++) {
                roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            window.location.href = `room.html?id=${roomCode}`;
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
