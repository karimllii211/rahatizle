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
    const profileModal = document.getElementById('profile-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');

    const showModal = (modal) => {
        if (loginModal) { loginModal.classList.add('hidden'); loginModal.classList.remove('flex'); }
        if (registerModal) { registerModal.classList.add('hidden'); registerModal.classList.remove('flex'); }
        if (platformModal) { platformModal.classList.add('hidden'); platformModal.classList.remove('flex'); }
        if (profileModal) { profileModal.classList.add('hidden'); profileModal.classList.remove('flex'); }
        if (forgotPasswordModal) { forgotPasswordModal.classList.add('hidden'); forgotPasswordModal.classList.remove('flex'); }
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
    document.querySelectorAll('.close-auth-modal, .close-platform-modal, .close-profile-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Arxa fona kliklədikdə bağlansın
    [loginModal, registerModal, platformModal, profileModal, forgotPasswordModal].forEach(modal => {
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
    
    // --- XSS & UTILS ---
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // --- ŞİFRƏNİ UNUTDUM ---
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => showModal(forgotPasswordModal));
    }

    window.sendEmailJSOTP = (email) => {
        console.log("EmailJS OTP will be sent to:", email);
        // TODO: Bura EmailJS kodları əlavə olunacaq
    };

    const sendOTPBtn = document.getElementById('sendOTPBtn');
    if (sendOTPBtn) {
        sendOTPBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail').value.trim();
            if (!email) return showToast("E-poçt daxil edin!");
            sendEmailJSOTP(email);
            showToast("Bərpa kodu göndərildi (funksiya hazır deyil).");
            closeAllModals();
        });
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
                    const isNewUser = result.additionalUserInfo?.isNewUser;
                    
                    if (isNewUser) {
                        user.delete().then(() => {
                            showModal(registerModal);
                            showToast("Zəhmət olmasa əvvəlcə qeydiyyatdan keçin.");
                        }).catch(err => console.error(err));
                    } else {
                        database.ref('users/' + user.uid).update({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || '',
                            photoURL: user.photoURL || '',
                            lastLogin: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => {
                            showToast("Uğurla daxil oldunuz!");
                            closeAllModals();
                        }).catch(error => console.error("Baza yazılma xətası:", error));
                    }
                })
                .catch(err => {
                    showToast(getErrorMessage(err.code));
                });
        });
    }

    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider)
                .then(result => {
                    const user = result.user;
                    const isNewUser = result.additionalUserInfo?.isNewUser;
                    
                    if (!isNewUser) {
                        auth.signOut().then(() => {
                            showModal(loginModal);
                            showToast("Siz artıq qeydiyyatdan keçmisiniz. Zəhmət olmasa daxil olun.");
                        });
                    } else {
                        // Yeni Google istifadəçisidir, avtomatik username yaradaq (email əsasında)
                        const emailPrefix = user.email.split('@')[0];
                        const cleanUsername = emailPrefix + Math.floor(Math.random() * 1000);
                        const username = '@' + cleanUsername;
                        
                        database.ref('usernames/' + cleanUsername).set(user.uid);
                        database.ref('users/' + user.uid).update({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || '',
                            username: username,
                            photoURL: user.photoURL || '',
                            lastLogin: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => {
                            showToast("Uğurla qeydiyyatdan keçdiniz!");
                            closeAllModals();
                        }).catch(error => console.error("Baza yazılma xətası:", error));
                    }
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
            const fname = escapeHTML(regFirstName.value.trim());
            const lname = escapeHTML(regLastName.value.trim());
            const usernameInput = document.getElementById('regUsername');
            const username = usernameInput ? escapeHTML(usernameInput.value.trim()) : '';
            const email = regEmail.value.trim();
            const pwd = regPassword.value.trim();
            const pwdConf = regPasswordConfirm.value.trim();
            
            const genderSelect = document.getElementById('regGender');
            const gender = genderSelect ? genderSelect.value : '';
            
            const photoURLInput = document.getElementById('regPhotoURL');
            const photoURL = photoURLInput ? photoURLInput.value.trim() : '';

            if (!fname || !lname || !email || !pwd || !pwdConf || !username || !gender) {
                return showToast("Zəhmət olmasa bütün xanaları doldurun!");
            }

            if (!username.startsWith('@')) {
                return showToast("İstifadəçi adı '@' simvolu ilə başlamalıdır!");
            }

            if (pwd !== pwdConf) {
                return showToast("Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin.");
            }

            if (pwd.length < 6) {
                return showToast("Şifrə ən azı 6 simvol olmalıdır!");
            }

            const cleanUsername = username.substring(1);
            database.ref('usernames/' + cleanUsername).once('value').then(snapshot => {
                if (snapshot.exists()) {
                    return showToast("Bu istifadəçi adı artıq mövcuddur!");
                }
                
                auth.createUserWithEmailAndPassword(email, pwd)
                    .then(userCredential => {
                        const fullName = fname + " " + lname;
                        const user = userCredential.user;
                        return user.updateProfile({
                            displayName: fullName,
                            photoURL: photoURL
                        }).then(() => {
                            const dashboardUserName = document.getElementById('dashboardUserName');
                            if (dashboardUserName) {
                                dashboardUserName.textContent = fullName;
                            }
                            
                            // Unikal username yazılması
                            database.ref('usernames/' + cleanUsername).set(user.uid);
                            
                            return database.ref('users/' + user.uid).update({
                                uid: user.uid,
                                email: user.email,
                                displayName: fullName,
                                username: username,
                                gender: gender,
                                photoURL: photoURL,
                                lastLogin: firebase.database.ServerValue.TIMESTAMP
                            });
                        });
                    })
                    .catch(err => showToast(getErrorMessage(err.code)));
            });
        });
    }

    // --- PROFIL MODAL VƏ AKTİV OTAQLAR ---
    const openProfileBtn = document.getElementById('openProfileBtn');
    const profileActiveRoomsList = document.getElementById('profileActiveRoomsList');

    if (openProfileBtn) {
        openProfileBtn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const profileName = document.getElementById('profileName');
            const profilePhone = document.getElementById('profilePhone');
            const profileEmail = document.getElementById('profileEmail');
            const profilePhotoURL = document.getElementById('profilePhotoURL');

            if (profileName) profileName.value = currentUser.displayName || '';
            if (profileEmail) profileEmail.value = currentUser.email || '';
            if (profilePhotoURL) profilePhotoURL.value = currentUser.photoURL || '';
            
            // Telefon nömrəsini bazadan çək
            database.ref('users/' + currentUser.uid).once('value').then(snapshot => {
                const data = snapshot.val();
                if (data && data.phone && profilePhone) {
                    profilePhone.value = data.phone;
                } else if (profilePhone) {
                    profilePhone.value = '';
                }
                showModal(profileModal);
            });
        });
    }
    
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', () => {
            if (!currentUser) return;
            const newName = escapeHTML(document.getElementById('profileName').value.trim());
            const newPhone = escapeHTML(document.getElementById('profilePhone').value.trim());
            const newEmail = document.getElementById('profileEmail').value.trim();
            const newPhotoURL = document.getElementById('profilePhotoURL').value.trim();
            
            if (!newName) return showToast("Ad daxil edilməlidir.");
            if (!newEmail) return showToast("E-poçt daxil edilməlidir.");
            
            const promises = [];
            
            if (currentUser.email !== newEmail) {
                promises.push(currentUser.updateEmail(newEmail));
            }
            
            promises.push(currentUser.updateProfile({
                displayName: newName,
                photoURL: newPhotoURL
            }));

            Promise.all(promises).then(() => {
                const dashboardUserName = document.getElementById('dashboardUserName');
                if (dashboardUserName) {
                    dashboardUserName.textContent = newName;
                }
                const userAvatar = document.getElementById('userAvatar');
                if (userAvatar) {
                    userAvatar.src = newPhotoURL || `https://ui-avatars.com/api/?name=${newName}&background=FF014C&color=fff`;
                }
                
                return database.ref('users/' + currentUser.uid).update({
                    displayName: newName,
                    email: newEmail,
                    phone: newPhone,
                    photoURL: newPhotoURL
                });
            }).then(() => {
                showToast("Profil uğurla yeniləndi!");
                closeAllModals();
            }).catch(err => {
                showToast(getErrorMessage(err.code));
            });
        });
    }

    const renderActiveRooms = (rooms) => {
        if (!profileActiveRoomsList) return;
        
        profileActiveRoomsList.innerHTML = '';
        
        if (rooms.length === 0) {
            profileActiveRoomsList.innerHTML = '<div class="text-sm text-gray-500 py-2 text-center">Otaq tapılmadı.</div>';
            return;
        }

        rooms.forEach(room => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl mb-2';
            item.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-white uppercase tracking-wider">${room.id}</span>
                    <span class="text-[10px] text-gray-400 capitalize">${room.platform || 'Naməlum'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.location.href='room.html?id=${room.id}'" class="px-4 py-1.5 bg-[#FF014C]/20 hover:bg-[#FF014C] text-[#FF014C] hover:text-white border border-[#FF014C]/50 hover:border-transparent text-[11px] font-bold rounded-lg transition-all">Qoşul</button>
                    <button onclick="deleteRoom('${room.id}')" class="px-3 py-1.5 bg-red-900/30 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg border border-red-500/30 transition-all">Sil</button>
                </div>
            `;
            profileActiveRoomsList.appendChild(item);
        });
    };

    window.deleteRoom = async (roomId) => {
        const confirmDelete = await showConfirmModal("Otağı silmək istədiyinizə əminsiniz?");
        if (confirmDelete) {
            database.ref('rooms/' + roomId).remove()
                .then(() => showToast("Otaq silindi."))
                .catch(err => showToast(getErrorMessage(err.code)));
        }
    };

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
    let userRoomsRef = null;

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
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email.split('@')[0]}&background=FF014C&color=fff`;
            }

            // Otaqları yüklə
            userRoomsRef = database.ref('rooms');
            userRoomsRef.on('value', snapshot => {
                const data = snapshot.val();
                const myRooms = [];
                if (data) {
                    Object.keys(data).forEach(roomId => {
                        const room = data[roomId];
                        if (room.creator && room.creator.uid === user.uid) {
                            myRooms.push({
                                id: roomId,
                                platform: room.creator.platform
                            });
                        }
                    });
                }
                renderActiveRooms(myRooms);
            });

        } else {
            if (navUserView) { navUserView.classList.add('hidden'); navUserView.classList.remove('flex'); }
            if (navGuestView) { navGuestView.classList.remove('hidden'); navGuestView.classList.add('flex'); }
            if (footerGuestLinks) { footerGuestLinks.classList.remove('hidden'); footerGuestLinks.classList.add('flex'); }
            
            if (userRoomsRef) {
                userRoomsRef.off('value');
                userRoomsRef = null;
            }
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
                        auth.signOut();
                        window.location.replace('index.html');
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
            
            // Otaq yaratmaq üçün birbaşa yaradın, platforma seçimi room.html-də olacaq
            const roomCode = generateRoomCode();
            const defaultPlatform = "netflix"; // Default olaraq birini təyin edək
            
            database.ref('rooms/' + roomCode + '/creator').set({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email.split('@')[0]}&background=dc2626&color=fff`,
                platform: defaultPlatform,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                window.location.href = `room.html?id=${roomCode}&platform=${defaultPlatform}`;
            }).catch(error => {
                showToast("Otaq yaradılarkən xəta baş verdi.");
                console.error(error);
            });
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';
            if (!code) return showToast("Otaq kodunu daxil edin.");
            window.location.href = `room.html?id=${code}`;
        });
    }
});
