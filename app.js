// EmailJS Initialization
if (typeof emailjs !== 'undefined') {
    emailjs.init("-joV9uOaw310_PJCg");
}

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

    const closeAuthModals = document.querySelectorAll('.close-auth-modal, .close-platform-modal, .close-profile-modal');
    if (closeAuthModals.length > 0) {
        closeAuthModals.forEach(btn => btn.addEventListener('click', closeAllModals));
    }

    // Toggle Password Visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const svg = this.querySelector('svg');
            if (input.type === 'password') {
                input.type = 'text';
                // Eye-off icon
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>';
            } else {
                input.type = 'password';
                // Eye icon
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
            }
        });
    });

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
    
    function closeAllModals() {
        const modals = [loginModal, registerModal, forgotPasswordModal, document.getElementById('otp-modal')];
        modals.forEach(m => {
            if (m) {
                m.classList.add('hidden');
                m.classList.remove('flex');
            }
        });
        
        // Bütün formları və inputları təmizlə
        document.querySelectorAll('form').forEach(f => f.reset());
        document.querySelectorAll('input').forEach(i => {
            if (i.type !== 'radio' && i.type !== 'checkbox' && i.type !== 'submit' && !i.disabled && i.id !== 'profEmail') {
                i.value = '';
            }
        });
    }

    // Modal açmaq üçün düymələr
    document.querySelectorAll('.open-login-modal').forEach(btn => {
        btn.addEventListener('click', () => showModal(loginModal));
    });
    
    document.querySelectorAll('.open-register-modal').forEach(btn => {
        btn.addEventListener('click', () => showModal(registerModal));
    });

    // Arxa fona kliklədikdə bağlansın
    [loginModal, registerModal, platformModal, forgotPasswordModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAllModals();
            });
        }
    });

    const otpModal = document.getElementById('otp-modal');
    if (otpModal) {
        otpModal.addEventListener('click', (e) => {
            if (e.target === otpModal) {
                otpModal.classList.add('hidden');
                otpModal.classList.remove('flex');
            }
        });
        const closeOtp = document.querySelector('.close-otp-modal');
        if (closeOtp) closeOtp.addEventListener('click', () => {
            otpModal.classList.add('hidden');
            otpModal.classList.remove('flex');
        });
    }

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

    // --- ŞİFRƏNİ UNUTDUM (FİREBASE LİNKİ) ---
    window.sendFirebasePasswordReset = (email) => {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                showToast("Şifrə yeniləmə linki e-poçtunuza göndərildi!");
                closeAllModals();
            })
            .catch((error) => {
                showToast(getErrorMessage(error.code));
            });
    };

    const sendOTPBtn = document.getElementById('sendOTPBtn');
    if (sendOTPBtn) {
        sendOTPBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail').value.trim();
            if (!email) return showToast("E-poçt daxil edin!");
            sendFirebasePasswordReset(email);
        });
    }

    // --- EMAILJS OTP (YALNIZ PROFIL ÜÇÜN) ---
    let generatedOTP = null;
    let resendInterval = null;

    const startResendTimer = () => {
        const resendBtn = document.querySelectorAll('#resendOTPBtn');
        const timers = document.querySelectorAll('#resendTimer');
        
        resendBtn.forEach(btn => btn.classList.add('hidden'));
        timers.forEach(timer => {
            timer.classList.remove('hidden');
            timer.textContent = '60s';
        });

        let timeLeft = 60;
        if (resendInterval) clearInterval(resendInterval);
        
        resendInterval = setInterval(() => {
            timeLeft--;
            timers.forEach(timer => timer.textContent = timeLeft + 's');
            if (timeLeft <= 0) {
                clearInterval(resendInterval);
                resendBtn.forEach(btn => btn.classList.remove('hidden'));
                timers.forEach(timer => timer.classList.add('hidden'));
            }
        }, 1000);
    };

    window.sendEmailJSOTP = (userEmail) => {
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        generatedOTP = otpCode.toString();
        
        emailjs.send("service_9umksl7", "template_0aiimmq", {
            security_code: otpCode, 
            email: userEmail 
        }, "-joV9uOaw310_PJCg")
        .then(function(response) {
            showToast("6 rəqəmli kod e-poçtunuza göndərildi!");
            const modal = document.getElementById('otp-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            const otpStep = document.getElementById('otpStepContainer');
            const newPwdStep = document.getElementById('newPasswordStepContainer');
            if (otpStep) otpStep.classList.remove('hidden');
            if (newPwdStep) newPwdStep.classList.add('hidden');
            startResendTimer();
        }).catch(function(error) {
            console.error("EmailJS Xətası:", error);
            showToast("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
        });
    };

    const requestPasswordChangeBtn = document.getElementById('requestPasswordChangeBtn');
    if (requestPasswordChangeBtn) {
        requestPasswordChangeBtn.addEventListener('click', () => {
            if (!currentUser || !currentUser.email) return;
            sendEmailJSOTP(currentUser.email);
        });
    }
    
    // Resend OTP düymələri üçün (həm index.html, həm profile.html)
    document.querySelectorAll('#resendOTPBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUser || !currentUser.email) return;
            sendEmailJSOTP(currentUser.email);
        });
    });

    const verifyOTPBtn = document.getElementById('verifyOTPBtn');
    if (verifyOTPBtn) {
        verifyOTPBtn.addEventListener('click', () => {
            const entered = document.getElementById('otpInput').value.trim();
            if (entered === generatedOTP) {
                const otpStep = document.getElementById('otpStepContainer');
                const newPwdStep = document.getElementById('newPasswordStepContainer');
                if (otpStep) otpStep.classList.add('hidden');
                if (newPwdStep) newPwdStep.classList.remove('hidden');
                showToast("Kod təsdiqləndi! Yeni şifrənizi təyin edin.");
            } else {
                showToast("Kod yanlışdır.");
            }
        });
    }

    const setNewPasswordBtn = document.getElementById('setNewPasswordBtn');
    if (setNewPasswordBtn) {
        setNewPasswordBtn.addEventListener('click', () => {
            const newPwd = document.getElementById('newPasswordInput').value.trim();
            if (newPwd.length < 6) return showToast("Şifrə ən azı 6 simvol olmalıdır.");
            
            const activeUser = auth.currentUser;
            if (!activeUser) {
                return showToast("XƏTA: Sistemə daxil olmadığınız üçün Firebase şifrənizi yeniləyə bilmir.");
            }

            activeUser.updatePassword(newPwd).then(() => {
                showToast("Şifrəniz uğurla yeniləndi!");
                const modal = document.getElementById('otp-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            }).catch(async err => {
                if (err.code === 'auth/requires-recent-login') {
                    // Mövcud şifrəni istəyən modal çıxart
                    const oldPwdPrompt = prompt("Təhlükəsizlik üçün zəhmət olmasa cari (köhnə) şifrənizi daxil edin:");
                    if (oldPwdPrompt) {
                        try {
                            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPwdPrompt);
                            await currentUser.reauthenticateWithCredential(credential);
                            await currentUser.updatePassword(newPwd);
                            showToast("Sessiya yeniləndi və şifrə uğurla dəyişdirildi!");
                            const modal = document.getElementById('otp-modal');
                            if (modal) {
                                modal.classList.add('hidden');
                                modal.classList.remove('flex');
                            }
                        } catch (reauthErr) {
                            showToast("Köhnə şifrə yalnışdır. Təkrar cəhd edin.");
                        }
                    } else {
                        showToast("Şifrəni yeniləmək üçün sessiya təsdiqlənməlidir.");
                    }
                } else {
                    showToast(getErrorMessage(err.code));
                }
            });
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
                    database.ref('users/' + user.uid).update({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || '',
                        lastLogin: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => {
                        showToast("Uğurla qeydiyyatdan keçdiniz!");
                        closeAllModals();
                    }).catch(error => console.error("Baza yazılma xətası:", error));
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
            const email = regEmail.value.trim();
            const pwd = regPassword.value.trim();
            const pwdConf = regPasswordConfirm.value.trim();
            
            const genderSelect = document.getElementById('regGender');
            const gender = genderSelect ? genderSelect.value : '';
            
            const photoURLInput = document.getElementById('regPhotoURL');
            const photoURL = photoURLInput ? photoURLInput.value.trim() : '';

            if (!fname || !lname || !email || !pwd || !pwdConf || !gender) {
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
                        displayName: fullName,
                        photoURL: photoURL
                    }).then(() => {
                        const dashboardUserName = document.getElementById('dashboardUserName');
                        if (dashboardUserName) {
                            dashboardUserName.textContent = fullName;
                        }
                        
                        return database.ref('users/' + user.uid).update({
                            uid: user.uid,
                            email: user.email,
                            displayName: fullName,
                            gender: gender,
                            photoURL: photoURL,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        });
                    });
                })
                .catch(err => showToast(getErrorMessage(err.code)));
        });
    }

    // --- PROFİL MƏNTİQİ (profile.html) ---
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            if (!currentUser) return;
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                
                currentUser.updateProfile({ photoURL: base64String }).then(() => {
                    const profilePageAvatar = document.getElementById('profilePageAvatar');
                    if (profilePageAvatar) profilePageAvatar.src = base64String;
                    
                    const navAvatar = document.getElementById('navAvatar');
                    if (navAvatar) {
                        navAvatar.src = base64String;
                        navAvatar.classList.remove('hidden');
                        const txt = document.getElementById('navAvatarText');
                        if (txt) txt.classList.add('hidden');
                    }

                    database.ref('users/' + currentUser.uid).update({ photoURL: base64String });
                    showToast("Profil şəkli yeniləndi!");
                }).catch(err => showToast("Şəkil yenilənərkən xəta baş verdi."));
            };
            reader.readAsDataURL(file);
        });
    }

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const fname = escapeHTML(document.getElementById('profFirstName').value.trim());
            const lname = escapeHTML(document.getElementById('profLastName').value.trim());
            const phone = escapeHTML(document.getElementById('profPhone').value.trim());
            const gender = document.getElementById('profGender').value;
            
            if (!fname) return showToast("Ad mütləqdir!");
            
            const fullName = fname + (lname ? " " + lname : "");
            
            currentUser.updateProfile({ displayName: fullName }).then(() => {
                const profilePageName = document.getElementById('profilePageName');
                if (profilePageName) profilePageName.textContent = fullName;
                
                return database.ref('users/' + currentUser.uid).update({
                    displayName: fullName,
                    phone: phone,
                    gender: gender
                });
            }).then(() => {
                showToast("Məlumatlar yadda saxlanıldı!");
            }).catch(err => showToast(getErrorMessage(err.code)));
        });
    }



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
            
            // Avatar logic
            const initials = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : user.email.charAt(0).toUpperCase();
            
            const navAvatar = document.getElementById('navAvatar');
            const navAvatarText = document.getElementById('navbar-avatar-text');
            if (navAvatar && navAvatarText) {
                if (user.photoURL) {
                    navAvatar.src = user.photoURL;
                    navAvatar.classList.remove('hidden');
                    navAvatarText.classList.add('hidden');
                } else {
                    navAvatar.classList.add('hidden');
                    navAvatarText.classList.remove('hidden');
                    navAvatarText.innerText = initials;
                }
            }

            const profilePageAvatar = document.getElementById('profilePageAvatar');
            const profilePageAvatarText = document.getElementById('profile-avatar-text');
            if (profilePageAvatar && profilePageAvatarText) {
                if (user.photoURL) {
                    profilePageAvatar.src = user.photoURL;
                    profilePageAvatar.classList.remove('hidden');
                    profilePageAvatarText.classList.add('hidden');
                } else {
                    profilePageAvatar.classList.add('hidden');
                    profilePageAvatarText.classList.remove('hidden');
                    profilePageAvatarText.innerText = initials;
                }
            }

            // Otaqları yüklə
            userRoomsRef = database.ref('rooms');
            userRoomsRef.on('value', snapshot => {
                const rooms = snapshot.val();
                const list1 = document.getElementById('profileActiveRoomsList');
                const list2 = document.getElementById('profileRoomsList');
                
                const updateList = (container) => {
                    if (!container) return;
                    container.innerHTML = '';
                    let hasRoom = false;

                    for (const roomId in rooms) {
                        const room = rooms[roomId];
                        if (room.creator && room.creator.uid === user.uid) {
                            hasRoom = true;
                            const platform = room.creator.platform || 'Bilinmir';
                            const date = new Date(room.creator.createdAt || Date.now()).toLocaleDateString('az-AZ');
                            
                            container.innerHTML += `
                                <div class="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                                    <div>
                                        <div class="text-[#FF014C] font-bold tracking-widest text-lg">${roomId}</div>
                                        <div class="text-xs text-gray-500">${platform} • ${date}</div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button onclick="window.location.href='room.html?id=${roomId}'" class="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Otağa daxil ol">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </button>
                                        <button onclick="deleteRoom('${roomId}')" class="p-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors border border-red-900/50 hover:border-red-600" title="Otağı sil">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                    }
                    if (!hasRoom) {
                        container.innerHTML = '<div class="text-sm text-gray-500 py-4 text-center">Aktiv otaq tapılmadı.</div>';
                    }
                };
                updateList(list1);
                updateList(list2);
            });
            
            // Profil form məlumatlarını doldur
            database.ref('users/' + user.uid).once('value').then(snapshot => {
                const data = snapshot.val();
                const pageName = document.getElementById('profilePageName');
                const pageLoading = document.getElementById('profilePageLoading');
                
                if (data) {
                    if (pageName) {
                        pageName.textContent = data.displayName || user.displayName || user.email.split('@')[0];
                        pageName.classList.remove('hidden');
                    }
                    if (pageLoading) pageLoading.style.display = 'none';
                    
                    const fnameInput = document.getElementById('profFirstName');
                    if (fnameInput && data.displayName) {
                        const parts = data.displayName.split(' ');
                        fnameInput.value = parts[0];
                        const lnameInput = document.getElementById('profLastName');
                        if (lnameInput) lnameInput.value = parts.slice(1).join(' ');
                    }
                    const uEmail = document.getElementById('profEmail');
                    if (uEmail) uEmail.value = data.email || '';
                    const uPhone = document.getElementById('profPhone');
                    if (uPhone) uPhone.value = data.phone || '';
                    const uGender = document.getElementById('profGender');
                    if (uGender && data.gender) uGender.value = data.gender;
                } else {
                    if (pageName) pageName.style.display = 'none';
                }
            }).catch(err => {
                const pageName = document.getElementById('profilePageName');
                if (pageName) pageName.style.display = 'none';
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

    // --- ÇIXIŞ VƏ HESABI SİL LOGIC ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const conf = await showConfirmModal("Hesabınızdan çıxmaq istədiyinizə əminsiniz?");
            if (conf) {
                auth.signOut().then(() => {
                    window.location.replace('index.html');
                });
            }
        });
    }

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
            if (!currentUser) {
                showModal(loginModal);
                return;
            }
            
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
