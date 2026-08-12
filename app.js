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
    if (result && result.user) {
        console.log("Google ilə uğurla daxil olundu:", result.user.displayName);
    }
}).catch(error => {
    alert("Google giriş xətası: " + error.message);
});

document.addEventListener('DOMContentLoaded', () => {
    // Bölmələr
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    // Auth Form Elements
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    // Dashboard Elements
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    let currentUser = null;

    // STATE MANAGEMENT (Görünüş Nəzarəti)
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            // Daxil olubsa - Auth-u gizlət, Dashboard-u göstər
            if (authSection) {
                authSection.classList.add('hidden');
            }
            if (dashboardSection) {
                dashboardSection.classList.remove('hidden');
                dashboardSection.classList.add('flex');
            }
            
            // Profil məlumatlarını yenilə
            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0] || "İstifadəçi";
            }
            if (userAvatar) {
                userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=1e3a8a&color=fff`;
            }
        } else {
            // Çıxış edibsə - Dashboard-u gizlət, Auth-u göstər
            if (dashboardSection) {
                dashboardSection.classList.add('hidden');
                dashboardSection.classList.remove('flex');
            }
            if (authSection) {
                authSection.classList.remove('hidden');
            }
        }
    });

    const getCredentials = () => {
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        return { email, password };
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const { email, password } = getCredentials();
            if (!email || !password) return alert("E-poçt və şifrəni daxil edin.");
            auth.signInWithEmailAndPassword(email, password)
                .catch(err => alert("Giriş xətası: " + err.message));
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const { email, password } = getCredentials();
            if (!email || !password) return alert("E-poçt və şifrəni daxil edin.");
            if (password.length < 6) return alert("Şifrə ən azı 6 simvoldan ibarət olmalıdır!");
            
            auth.createUserWithEmailAndPassword(email, password)
                .catch(err => alert("Qeydiyyat xətası: " + err.message));
        });
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', () => {
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) return alert("Şifrəni sıfırlamaq üçün əvvəlcə e-poçt ünvanınızı yazın.");
            auth.sendPasswordResetEmail(email)
                .then(() => alert("Sıfırlama linki göndərildi!"))
                .catch(err => alert("Sıfırlama xətası: " + err.message));
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithRedirect(provider);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(err => alert("Çıxış xətası: " + err.message));
        });
    }

    // --- OTAQ MƏNTİQİ ---
    const generateRoomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code; // məs: RAVE9X
    };

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            if (!currentUser) return alert("Əvvəlcə hesaba daxil olmalısınız!");
            
            const roomCode = generateRoomCode();
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=1e3a8a&color=fff`,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = `room.html?id=${roomCode}`;
            }).catch(error => {
                alert("Xəta: " + error.message);
            });
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';
            if (!code) return alert("Otaq kodunu daxil edin.");
            window.location.href = `room.html?id=${code}`;
        });
    }
});
