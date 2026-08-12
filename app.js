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
    const authPanel = document.getElementById('authPanel');
    const roomPanel = document.getElementById('roomPanel');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    // Auth state listener
    auth.onAuthStateChanged(user => {
        if (user) {
            // Logged in
            if (authPanel) authPanel.classList.add('hidden');
            if (roomPanel) roomPanel.classList.remove('hidden');
        } else {
            // Not logged in
            if (authPanel) authPanel.classList.remove('hidden');
            if (roomPanel) roomPanel.classList.add('hidden');
        }
    });

    // Google Login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider).catch(error => {
                console.error("Giriş xətası:", error);
                alert("Giriş zamanı xəta baş verdi.");
            });
        });
    }

    // Otaq Yarat
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

    // Otağa Qoşul
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
