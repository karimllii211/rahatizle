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
const database = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    
    // --- BİLDİRİŞ (TOAST) VƏ TƏSDİQ (CONFIRM) MƏNTİQİ ---
    const customToast = document.getElementById('custom-toast');
    const toastMessage = document.getElementById('toast-message');
    const toastCloseBtn = document.getElementById('toast-close-btn');

    let toastTimeout;
    const showToast = (message) => {
        if (!customToast || !toastMessage) return;
        toastMessage.textContent = message;
        customToast.classList.remove('hidden');
        customToast.classList.add('flex');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            closeToast();
        }, 3000);
    };

    const closeToast = () => {
        if (customToast) {
            customToast.classList.add('hidden');
            customToast.classList.remove('flex');
        }
    };

    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', closeToast);
    }

    const customConfirm = document.getElementById('custom-confirm');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    const showConfirmModal = (message) => {
        return new Promise((resolve) => {
            if (!customConfirm || !confirmMessage) {
                resolve(confirm(message));
                return;
            }
            confirmMessage.textContent = message;
            customConfirm.classList.remove('hidden');
            customConfirm.classList.add('flex');

            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                customConfirm.classList.add('hidden');
                customConfirm.classList.remove('flex');
                confirmYesBtn.removeEventListener('click', handleYes);
                confirmNoBtn.removeEventListener('click', handleNo);
            };

            confirmYesBtn.addEventListener('click', handleYes);
            confirmNoBtn.addEventListener('click', handleNo);
        });
    };

    // --- FIREBASE XƏTA TƏRCÜMƏSİ ---
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-email':
                return 'E-poçt və ya şifrə yalnışdır.';
            case 'auth/email-already-in-use':
                return 'Bu e-poçt hesabı artıq mövcuddur.';
            case 'auth/weak-password':
                return 'Şifrə ən azı 6 simvol olmalıdır.';
            case 'auth/requires-recent-login':
                return 'Təhlükəsizlik məqsədilə hesabınızı silmək üçün zəhmət olmasa hesabdan çıxış edib yenidən daxil olun.';
            case 'auth/popup-closed-by-user':
                return 'Giriş pəncərəsi bağlandı.';
            default:
                return 'Bilinməyən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
        }
    };

    // --- MODAL İDARƏETMƏSİ ---
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const platformModal = document.getElementById('platform-modal');

    const showModal = (modal) => {
        if (loginModal) { loginModal.classList.add('hidden'); loginModal.classList.remove('flex'); }
        if (registerModal) { registerModal.classList.add('hidden'); registerModal.classList.remove('flex'); }
        if (platformModal) { platformModal.classList.add('hidden'); platformModal.classList.remove('flex'); }
        if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    };
    
    const closeAllModals = () => {
        showModal(null);
    };

    // Modal açmaq üçün düymələr
    document.querySelectorAll('.open-login-modal').forEach(btn => {
        btn.addEventListener('click', () => showModal(loginModal));
    });
    
    document.querySelectorAll('.open-register-modal').forEach(btn => {
        btn.addEventListener('click', () => showModal(registerModal));
    });

    // Modal bağlamaq üçün X düymələri
    document.querySelectorAll('.close-auth-modal, .close-platform-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Arxa fona kliklədikdə bağlansın
    [loginModal, registerModal, platformModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAllModals();
            });
        }
    });

    const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', () => showModal(registerModal));
    }

    const switchToLoginBtn = document.getElementById('switchToLoginBtn');
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', () => showModal(loginModal));
    }

    // --- GİRİŞ (LOGIN) ---
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = loginEmail.value.trim();
            const password = loginPassword.value.trim();
            if (!email || !password) return showToast("E-poçt və şifrəni daxil edin.");
            
            auth.signInWithEmailAndPassword(email, password)
                .catch(err => showToast(getErrorMessage(err.code)));
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider)
                .then(result => {
                    const user = result.user;
                    database.ref('users/' + user.uid).update({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || '',
                        lastLogin: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => console.log("Məlumat bazaya uğurla yazıldı!"))
                    .catch(error => console.error("Baza yazılma xətası:", error));
                })
                .catch(err => {
                    showToast(getErrorMessage(err.code));
                });
        });
    }

    // --- QEYDİYYAT (REGISTER) ---
    const regFirstName = document.getElementById('regFirstName');
    const regLastName = document.getElementById('regLastName');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regPasswordConfirm = document.getElementById('regPasswordConfirm');
    const completeRegisterBtn = document.getElementById('completeRegisterBtn');

    if (completeRegisterBtn) {
        completeRegisterBtn.addEventListener('click', () => {
            const fname = regFirstName.value.trim();
            const lname = regLastName.value.trim();
            const email = regEmail.value.trim();
            const pwd = regPassword.value.trim();
            const pwdConf = regPasswordConfirm.value.trim();

            if (!fname || !lname || !email || !pwd || !pwdConf) {
                return showToast("Zəhmət olmasa bütün xanaları doldurun!");
            }

            if (pwd !== pwdConf) {
                return showToast("Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin.");
            }

            if (pwd.length < 6) {
                return showToast("Şifrə ən azı 6 simvol olmalıdır!");
            }

            auth.createUserWithEmailAndPassword(email, pwd)
                .then(userCredential => {
                    const fullName = fname + " " + lname;
                    const user = userCredential.user;
                    return user.updateProfile({
                        displayName: fullName
                    }).then(() => {
                        const dashboardUserName = document.getElementById('dashboardUserName');
                        if (dashboardUserName) {
                            dashboardUserName.textContent = fullName;
                        }
                        
                        database.ref('users/' + user.uid).update({
                            uid: user.uid,
                            email: user.email,
                            displayName: fullName,
                            lastLogin: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => console.log("Məlumat bazaya uğurla yazıldı!"))
                        .catch(error => console.error("Baza yazılma xətası:", error));
                    });
                })
                .catch(err => showToast(getErrorMessage(err.code)));
        });
    }

    // --- DASHBOARD (İDARƏ PANELİ) ---
    const dashboardUserName = document.getElementById('dashboardUserName');
    const navGuestView = document.getElementById('nav-guest-view');
    const navUserView = document.getElementById('nav-user-view');
    const footerGuestLinks = document.getElementById('footer-guest-links');

    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    let currentUser = null;

    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            closeAllModals();
            if (navUserView) { navUserView.classList.remove('hidden'); navUserView.classList.add('flex'); }
            if (navGuestView) { navGuestView.classList.add('hidden'); navGuestView.classList.remove('flex'); }
            if (footerGuestLinks) { footerGuestLinks.classList.add('hidden'); footerGuestLinks.classList.remove('flex'); }
            if (dashboardUserName) {
                dashboardUserName.textContent = user.displayName || user.email.split('@')[0] || "İstifadəçi";
            }
        } else {
            if (navUserView) { navUserView.classList.add('hidden'); navUserView.classList.remove('flex'); }
            if (navGuestView) { navGuestView.classList.remove('hidden'); navGuestView.classList.add('flex'); }
            if (footerGuestLinks) { footerGuestLinks.classList.remove('hidden'); footerGuestLinks.classList.add('flex'); }
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(err => showToast(getErrorMessage(err.code)));
        });
    }

    // --- HESABI SİL LOGIC ---
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            
            const confirmDelete = await showConfirmModal("Hesabınızı və bütün məlumatlarınızı birdəfəlik silmək istədiyinizə əminsiniz?");
            if (confirmDelete) {
                database.ref('users/' + currentUser.uid).remove()
                    .then(() => {
                        return currentUser.delete();
                    })
                    .then(() => {
                        showToast("Hesabınız və bütün məlumatlarınız uğurla silindi.");
                    })
                    .catch(error => {
                        showToast(getErrorMessage(error.code));
                    });
            }
        });
    }

    // --- OTAQ MƏNTİQİ VƏ PLATFORM SEÇİMİ ---
    const generateRoomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            if (!currentUser) return showToast("Əvvəlcə hesaba daxil olmalısınız!");
            
            // Otaq yaratmaq əvəzinə platforma seçimini aç
            showModal(platformModal);
        });
    }

    // Platforma seçildikdən sonra otaq yarat və yönləndir
    document.querySelectorAll('.platform-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const selectedPlatform = btn.getAttribute('data-platform');
            const roomCode = generateRoomCode();
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=dc2626&color=fff`,
                platform: selectedPlatform,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = `room.html?id=${roomCode}&platform=${selectedPlatform}`;
            }).catch(error => {
                showToast("Otaq yaradılarkən xəta baş verdi.");
                console.error(error);
            });
        });
    });

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';
            if (!code) return showToast("Otaq kodunu daxil edin.");
            // Qoşulan zaman hələlik platforma ehtiyac yoxdur, room.html içində tapılacaq
            window.location.href = `room.html?id=${code}`;
        });
    }
});
