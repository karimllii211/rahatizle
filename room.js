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

// Auth Guard
auth.onAuthStateChanged(user => {
    if (!user) {
        // İstifadəçi daxil olmayıbsa dərhal index.html-ə yönləndir
        window.location.replace('index.html');
    } else {
        // İstifadəçi daxil olubsa, səhifəni göstər və məntiqi başlat
        document.body.classList.remove('opacity-0');
        console.log("İstifadəçi:", user.displayName || user.email);
        initRoom();
    }
});

function initRoom() {
    console.log("Otaq məntiqi bura yazılacaq");

    // URL-dən otaq kodunu (id) oxumaq
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (roomId) {
        console.log("Otaq Kodu:", roomId);
        // Otaq kodunu ekranda göstərmək
        const displayRoomCode = document.getElementById('displayRoomCode');
        if (displayRoomCode) {
            displayRoomCode.textContent = roomId;
        }
    } else {
        console.log("Otaq kodu tapılmadı.");
    }
}
