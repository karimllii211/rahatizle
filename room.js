// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdbOsVymHIPfjbw3oByjb4pS-sEB8jv8c",
  authDomain: "rahatizle-yeni.firebaseapp.com",
  databaseURL: "https://rahatizle-yeni-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rahatizle-yeni",
  storageBucket: "rahatizle-yeni.firebasestorage.app",
  messagingSenderId: "364316761559",
  appId: "1:364316761559:web:acebb24e3012d4a0973f92",
  measurementId: "G-210JCWXKGE"
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
