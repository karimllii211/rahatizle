// Firebase configuration (Eyni olmalıdır)
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;

// --- TOAST ---
let toastTimeout;
const showToast = (message) => {
    const toast = document.getElementById('custom-toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    toast.classList.remove('animate-toast');
    void toast.offsetWidth;
    toast.classList.add('animate-toast');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }, 4000);
};

const toastCloseBtn = document.getElementById('toast-close-btn');
if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
        const toast = document.getElementById('custom-toast');
        if (toast) {
            toast.classList.add('hidden');
            toast.classList.remove('flex');
        }
    });
}

// Auth Guard
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.replace('/');
    } else {
        currentUser = user;
        initPlatformSelect();
    }
});

function initPlatformSelect() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!roomId) {
        window.location.replace('/');
        return;
    }

    const backLink = document.getElementById('backToRoomLink');
    if (backLink) backLink.href = '/room?id=' + encodeURIComponent(roomId);

    const roomRef = database.ref(`rooms/${roomId}`);

    // Otaq silinibsə ana səhifəyə qaytar
    roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            window.location.replace('/');
        }
    });

    // Hazırda seçili olan platformanı vizual olaraq qeyd et
    roomRef.child('creator/platform').once('value').then(snapshot => {
        const current = snapshot.val();
        if (current) {
            const card = document.querySelector(`.platform-select-card[data-platform="${current}"]`);
            if (card) card.classList.add('border-white/50', 'bg-white/10');
        }
    });

    document.querySelectorAll('.platform-select-card').forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.getAttribute('data-platform');

            roomRef.child('creator').once('value').then(snapshot => {
                const creatorData = snapshot.val();
                if (!creatorData || creatorData.uid !== currentUser.uid) {
                    showToast('Yalnız otaq yaradanı platformanı dəyişə bilər.');
                    return;
                }

                if (platform === 'youtube') {
                    window.location.href = '/youtube-search?id=' + encodeURIComponent(roomId);
                    return;
                }

                roomRef.child('creator/platform').set(platform).then(() => {
                    window.location.href = '/room?id=' + encodeURIComponent(roomId) + '&platform=' + encodeURIComponent(platform);
                }).catch(() => {
                    showToast('Platforma dəyişdirilə bilmədi. Yenidən cəhd edin.');
                });
            });
        });
    });
}
