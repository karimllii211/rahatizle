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
    
    // --- BÖLMƏLƏR (SECTIONS) ---
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const dashboardSection = document.getElementById('dashboard-section');

    // Mərkəzi Görünüş İdarəsi
    const showSection = (sectionToShow) => {
        if(loginSection) loginSection.classList.add('hidden');
        if(registerSection) registerSection.classList.add('hidden');
        if(dashboardSection) dashboardSection.classList.add('hidden');
        
        if (sectionToShow) sectionToShow.classList.remove('hidden');
    };

    // Bölmələr arası keçid düymələri
    const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', () => showSection(registerSection));
    }

    const switchToLoginBtn = document.getElementById('switchToLoginBtn');
    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', () => showSection(loginSection));
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
            if (!email || !password) return alert("E-poçt və şifrəni daxil edin.");
            
            auth.signInWithEmailAndPassword(email, password)
                .catch(err => alert("Giriş xətası: " + err.message));
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            // Döngü xətasını həll etmək üçün signInWithPopup istifadə edirik
            auth.signInWithPopup(provider)
                .then(result => {
                    const user = result.user;
                    // İstifadəçi məlumatlarını Realtime Database-ə yaz (və ya yenilə)
                    database.ref('users/' + user.uid).update({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || '',
                        lastLogin: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => console.log("Məlumat bazaya uğurla yazıldı!"))
                    .catch(error => console.error("Baza yazılma xətası:", error));
                })
                .catch(err => {
                    alert("Google giriş xətası: " + err.message);
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
                return alert("Zəhmət olmasa bütün xanaları doldurun!");
            }

            if (pwd !== pwdConf) {
                return alert("Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin.");
            }

            if (pwd.length < 6) {
                return alert("Şifrə ən azı 6 simvol olmalıdır!");
            }

            auth.createUserWithEmailAndPassword(email, pwd)
                .then(userCredential => {
                    const fullName = fname + " " + lname;
                    const user = userCredential.user;
                    // Dərhal profili yeniləyirik
                    return user.updateProfile({
                        displayName: fullName
                    }).then(() => {
                        // Yeniləmədən sonra UI-da dərhal əks olunması üçün
                        const dashboardUserName = document.getElementById('dashboardUserName');
                        if (dashboardUserName) {
                            dashboardUserName.textContent = fullName;
                        }
                        
                        // İstifadəçi məlumatlarını Realtime Database-ə yaz
                        database.ref('users/' + user.uid).update({
                            uid: user.uid,
                            email: user.email,
                            displayName: fullName,
                            lastLogin: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => console.log("Məlumat bazaya uğurla yazıldı!"))
                        .catch(error => console.error("Baza yazılma xətası:", error));
                    });
                })
                .catch(err => alert("Qeydiyyat xətası: " + err.message));
        });
    }

    // --- DASHBOARD (İDARƏ PANELİ) ---
    const dashboardUserName = document.getElementById('dashboardUserName');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    let currentUser = null;

    // STATE MANAGEMENT (Görünüş Nəzarəti)
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            // İstifadəçi var - Birbaşa Dashboard göstər
            showSection(dashboardSection);
            
            if (dashboardUserName) {
                dashboardUserName.textContent = user.displayName || user.email.split('@')[0] || "İstifadəçi";
            }
        } else {
            // İstifadəçi yoxdur - Login göstər
            showSection(loginSection);
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(err => alert("Çıxış xətası: " + err.message));
        });
    }

    // --- HESABI SİL LOGIC ---
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const confirmDelete = confirm("Hesabınızı və bütün məlumatlarınızı birdəfəlik silmək istədiyinizə əminsiniz?");
            if (confirmDelete) {
                // Əvvəlcə Realtime Database-dən istifadəçinin məlumatlarını sil
                database.ref('users/' + currentUser.uid).remove()
                    .then(() => {
                        // Baza silindikdən sonra Firebase Auth-dan istifadəçini sil
                        return currentUser.delete();
                    })
                    .then(() => {
                        alert("Hesabınız və bütün məlumatlarınız uğurla silindi.");
                    })
                    .catch(error => {
                        // Təhlükəsizlik üçün 'auth/requires-recent-login' xətası
                        if (error.code === 'auth/requires-recent-login') {
                            alert("Təhlükəsizlik məqsədilə hesabınızı silmək üçün zəhmət olmasa hesabdan çıxış edib yenidən daxil olun.");
                        } else {
                            alert("Hesab silinərkən xəta baş verdi: " + error.message);
                        }
                    });
            }
        });
    }

    // --- OTAQ MƏNTİQİ ---
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
            if (!currentUser) return alert("Əvvəlcə hesaba daxil olmalısınız!");
            
            const roomCode = generateRoomCode();
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=dc2626&color=fff`,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = `room.html?id=${roomCode}`;
            }).catch(error => {
                alert("Otaq yaradılarkən xəta: " + error.message);
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
