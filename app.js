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
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

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
        // Animasiyanı hər göstərişdə yenidən işə salırıq
        customToast.classList.remove('animate-toast');
        void customToast.offsetWidth;
        customToast.classList.add('animate-toast');

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
        const modals = [
            loginModal, registerModal, forgotPasswordModal, 
            document.getElementById('otp-modal'),
            document.getElementById('change-email-modal'),
            document.getElementById('reauth-modal')
        ];
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
    [loginModal, registerModal, platformModal, forgotPasswordModal, document.getElementById('change-email-modal'), document.getElementById('reauth-modal')].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAllModals();
            });
        }
    });

    const closeEmailModal = document.querySelector('.close-email-modal');
    if (closeEmailModal) closeEmailModal.addEventListener('click', closeAllModals);

    const closeReauthModal = document.querySelector('.close-reauth-modal');
    if (closeReauthModal) closeReauthModal.addEventListener('click', closeAllModals);

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
    
    // --- INPUT VALİDASİYASI ---
    // Qeyd: mətnlər HTML kimi deyil, `textContent`/`value` ilə göstərilir, ona görə
    // yazarkən HTML-escape etmək lazım deyil (əks halda "O'Brien" → "O&#39;Brien"
    // kimi görünürdü). Bunun əvəzinə uzunluq və nəzarət simvolları yoxlanılır.
    const cleanText = (str, maxLength = 60) => {
        if (!str) return '';
        return str
            .replace(/[\u0000-\u001F\u007F]/g, '') // nəzarət simvolları
            .trim()
            .slice(0, maxLength);
    };

    // --- ŞİFRƏNİ UNUTDUM ---
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => showModal(forgotPasswordModal));
    }

    const sendOTPBtn = document.getElementById('sendOTPBtn');
    if (sendOTPBtn) {
        sendOTPBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail').value.trim();
            if (!email) return showToast("E-poçt daxil edin!");
            otpMode = 'password';
            requestPasswordResetCode(email);
        });
    }

    // --- OTP (HƏM PROFIL, HƏM ŞİFRƏNİ UNUTDUM ÜÇÜN) ---
    // Kod hər iki axın üçün serverdə yaradılır və serverdən göndərilir;
    // brauzer yalnız kodsuz dəyərsiz olan "token"i saxlayır.
    let resetToken = null;        // şifrə bərpası axını üçün
    let enteredResetCode = null;
    let emailChangeToken = null;  // e-poçt dəyişmə axını üçün
    let resendInterval = null;
    let currentOTPRecoveryEmail = null;
    let otpMode = 'password'; // 'password' və ya 'email'
    let newEmailPending = null;

    const startResendTimer = () => {
        const resendBtns = document.querySelectorAll('#resendOTPBtn');
        const timers = document.querySelectorAll('#resendTimer');
        
        resendBtns.forEach(btn => btn.classList.add('hidden'));
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
                resendBtns.forEach(btn => btn.classList.remove('hidden'));
                timers.forEach(timer => timer.classList.add('hidden'));
            }
        }, 1000);
    };

    const openOTPModal = () => {
        const modal = document.getElementById('otp-modal');
        if (modal) {
            closeAllModals();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        const otpStep = document.getElementById('otpStepContainer');
        const newPwdStep = document.getElementById('newPasswordStepContainer');
        if (otpStep) otpStep.classList.remove('hidden');
        if (newPwdStep) newPwdStep.classList.add('hidden');
        startResendTimer();
    };

    // --- EMAILJS ŞİFRƏ BƏRPASI (FRONTEND) ---
    const requestPasswordResetCode = async (userEmail) => {
        currentOTPRecoveryEmail = userEmail;
        enteredResetCode = null;
        
        // 6 rəqəmli kod generasiya edirik
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        resetToken = otpCode; // Kodu yadda saxlayırıq (frontend yoxlanışı üçün)
        
        showToast("E-poçt göndərilir, zəhmət olmasa gözləyin...");
        
        // EmailJS göndərmə prosesi
        const sendEmail = () => {
            window.emailjs.send("service_9umksl7", "template_0aiimmq", {
                security_code: otpCode,
                email: userEmail,
                to_email: userEmail,
                message: otpCode,
                otp_code: otpCode
            }, "-joV9uOaw310_PJCg")
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showToast("6 rəqəmli kod e-poçtunuza göndərildi!");
                openOTPModal();
            }, function(error) {
                console.error('EmailJS ERROR:', error);
                showToast("Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
            });
        };

        if (typeof window.emailjs === 'undefined') {
            console.warn("EmailJS is undefined. Dynamically loading the script...");
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
            script.onload = () => {
                window.emailjs.init("-joV9uOaw310_PJCg");
                sendEmail();
            };
            script.onerror = () => {
                console.error("Failed to load EmailJS from CDN.");
                showToast("Xəta: EmailJS yüklənə bilmədi. İnternet bağlantınızı və ya brauzer icazələrini (CSP/AdBlock) yoxlayın.");
            };
            document.head.appendChild(script);
        } else {
            sendEmail();
        }
    };

    // E-poçt dəyişmə axını: kod serverdə yaradılır və yeni ünvana göndərilir,
    // bununla istifadəçinin həmin ünvana sahib olduğu sübut edilir. Bu əməliyyat
    // onsuz da cari şifrə ilə yenidən təsdiqdən (reauth) keçir.
    const requestEmailChangeCode = async (newEmail) => {
        currentOTPRecoveryEmail = newEmail;
        emailChangeToken = null;
        try {
            const response = await fetch('/api/verify-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request', newEmail })
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok && data.token) {
                emailChangeToken = data.token;
                showToast("6 rəqəmli kod e-poçtunuza göndərildi!");
                openOTPModal();
                return;
            }

            showToast(data.error || "Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        } catch (error) {
            console.error("Email OTP xətası:", error);
            showToast("Şəbəkə xətası baş verdi.");
        }
    };

    const requestPasswordChangeBtn = document.getElementById('requestPasswordChangeBtn');
    if (requestPasswordChangeBtn) {
        requestPasswordChangeBtn.addEventListener('click', () => {
            if (!currentUser || !currentUser.email) return;
            otpMode = 'password';
            requestPasswordResetCode(currentUser.email);
        });
    }

    // --- E-POÇTU DƏYİŞ MƏNTİQİ (PRE-REAUTH) ---
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    const changeEmailModal = document.getElementById('change-email-modal');
    const reauthModal = document.getElementById('reauth-modal');
    
    if (changeEmailBtn && reauthModal) {
        changeEmailBtn.addEventListener('click', () => {
            if (currentUser && currentUser.providerData && currentUser.providerData[0] && currentUser.providerData[0].providerId === 'google.com') {
                return showToast("Google hesablarının e-poçtu dəyişdirilə bilməz.");
            }
            document.getElementById('currentPasswordInput').value = '';
            showModal(reauthModal);
        });
    }

    const verifyReAuthBtn = document.getElementById('verifyReAuthBtn');
    if (verifyReAuthBtn) {
        verifyReAuthBtn.addEventListener('click', async () => {
            const pwd = document.getElementById('currentPasswordInput').value;
            if (!pwd) return showToast("Şifrəni daxil edin.");
            
            try {
                const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, pwd);
                await currentUser.reauthenticateWithCredential(credential);
                showToast("Təhlükəsizlik təsdiqləndi. İndi yeni e-poçtu yaza bilərsiniz.");
                closeAllModals();
                if (changeEmailModal) showModal(changeEmailModal);
            } catch (error) {
                showToast("Şifrə yanlışdır və ya xəta baş verdi.");
                console.error(error);
            }
        });
    }

    const sendEmailOTPBtn = document.getElementById('sendEmailOTPBtn');
    if (sendEmailOTPBtn) {
        sendEmailOTPBtn.addEventListener('click', () => {
            const newEmail = document.getElementById('newEmailInput').value.trim();
            if (!newEmail) return showToast("Yeni e-poçt daxil edin!");
            
            otpMode = 'email';
            newEmailPending = newEmail;
            requestEmailChangeCode(newEmail);
        });
    }

    async function executeEmailUpdate(newEmail) {
        try {
            await currentUser.updateEmail(newEmail);
            await database.ref('users/' + currentUser.uid).update({ email: newEmail });
            const profEmail = document.getElementById('profEmail');
            if (profEmail) profEmail.value = newEmail;
            showToast("E-poçtunuz uğurla yeniləndi!");
        } catch (error) {
            console.error("Email yeniləmə xətası:", error);
            showToast(getErrorMessage(error.code));
        }
    }
    
    // Resend OTP düymələri üçün
    document.querySelectorAll('#resendOTPBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentOTPRecoveryEmail) return;
            if (otpMode === 'password') {
                requestPasswordResetCode(currentOTPRecoveryEmail);
            } else {
                requestEmailChangeCode(currentOTPRecoveryEmail);
            }
        });
    });

    const verifyOTPBtn = document.getElementById('verifyOTPBtn');
    if (verifyOTPBtn) {
        verifyOTPBtn.addEventListener('click', async () => {
            const entered = document.getElementById('otpInput').value.trim();

            if (otpMode === 'password') {
                if (!/^\d{6}$/.test(entered)) return showToast("6 rəqəmli kodu daxil edin.");
                if (!resetToken) return showToast("Sessiyanın vaxtı bitib. Yeni kod tələb edin.");
                if (entered !== resetToken) return showToast("Kod yanlışdır.");
                enteredResetCode = entered;
                const otpStep = document.getElementById('otpStepContainer');
                const newPwdStep = document.getElementById('newPasswordStepContainer');
                if (otpStep) otpStep.classList.add('hidden');
                if (newPwdStep) newPwdStep.classList.remove('hidden');
                showToast("Yeni şifrənizi təyin edin.");
                return;
            }

            // otpMode === 'email'
            if (!/^\d{6}$/.test(entered)) return showToast("6 rəqəmli kodu daxil edin.");
            if (!emailChangeToken) return showToast("Sessiyanın vaxtı bitib. Yeni kod tələb edin.");

            verifyOTPBtn.disabled = true;
            try {
                const response = await fetch('/api/verify-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify', token: emailChangeToken, code: entered })
                });
                const data = await response.json().catch(() => ({}));
                if (response.ok && data.verified) {
                    emailChangeToken = null;
                    closeAllModals();
                    executeEmailUpdate(newEmailPending);
                } else {
                    showToast(data.error || "Kod yanlışdır.");
                }
            } catch (error) {
                showToast("Şəbəkə xətası baş verdi.");
            } finally {
                verifyOTPBtn.disabled = false;
            }
        });
    }

    const setNewPasswordBtn = document.getElementById('setNewPasswordBtn');
    if (setNewPasswordBtn) {
        setNewPasswordBtn.addEventListener('click', async () => {
            const newPwd = document.getElementById('newPasswordInput').value;
            if (newPwd.length < 8) return showToast("Şifrə ən azı 8 simvol olmalıdır.");

            if (!resetToken || !enteredResetCode) {
                return showToast("Sessiyanın vaxtı bitib. Yeni kod tələb edin.");
            }

            setNewPasswordBtn.disabled = true;
            try {
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'direct-reset',
                        email: currentOTPRecoveryEmail,
                        newPassword: newPwd
                    })
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok) {
                    resetToken = null;
                    enteredResetCode = null;
                    showToast("Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz.");
                    closeAllModals();
                    if (loginModal) showModal(loginModal);
                } else {
                    showToast(data.error || "Şifrə yenilənə bilmədi.");
                    if (data.details) console.error("Backend Xətası:", data.details);
                    if (response.status === 400) {
                        const otpStep = document.getElementById('otpStepContainer');
                        const newPwdStep = document.getElementById('newPasswordStepContainer');
                        if (otpStep) otpStep.classList.remove('hidden');
                        if (newPwdStep) newPwdStep.classList.add('hidden');
                    }
                }
            } catch (err) {
                console.error("Şifrə yeniləmə xətası:", err);
                showToast("Şəbəkə xətası baş verdi.");
            } finally {
                setNewPasswordBtn.disabled = false;
            }
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
                .catch(err => {
                    console.error("Giriş xətası:", err.code);
                    showToast(getErrorMessage(err.code));
                });
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
            const fname = cleanText(regFirstName.value);
            const lname = cleanText(regLastName.value);
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

            if (pwd.length < 8) {
                return showToast("Şifrə ən azı 8 simvol olmalıdır.");
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

    // --- PROFİL ŞƏKLİ ---
    const AVATAR_MAX_BYTES = 5 * 1024 * 1024;   // qəbul edilən fayl həddi
    const AVATAR_MAX_PX = 256;                  // saxlanılan ölçü
    const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Şəkli brauzerdə kiçildirik: əks halda böyük base64 sətri Firebase-in
    // photoURL limitini aşır və yükləmə tamamilə uğursuz olur.
    const processAvatarFile = (file) => new Promise((resolve, reject) => {
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            return reject(new Error("Yalnız JPG, PNG, WEBP və ya GIF şəkil yükləyə bilərsiniz."));
        }
        if (file.size > AVATAR_MAX_BYTES) {
            return reject(new Error("Şəklin ölçüsü 5 MB-dan çox olmamalıdır."));
        }

        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const scale = Math.min(1, AVATAR_MAX_PX / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Şəkil oxuna bilmədi."));
        };
        img.src = objectUrl;
    });

    const applyAvatarToUI = (dataUrl) => {
        const pairs = [
            ['profilePageAvatar', 'profilePageAvatarText'],
            ['navAvatar', 'navbar-avatar-text']
        ];
        pairs.forEach(([imgId, textId]) => {
            const img = document.getElementById(imgId);
            const text = document.getElementById(textId);
            if (img) {
                img.src = dataUrl;
                img.classList.remove('hidden');
            }
            if (text) text.classList.add('hidden');
        });
    };

    const handleAvatarSelection = async (input) => {
        if (!currentUser) return;
        const file = input.files && input.files[0];
        if (!file) return;

        try {
            const dataUrl = await processAvatarFile(file);
            await database.ref('users/' + currentUser.uid).update({ photoURL: dataUrl });
            // Auth profili yalnız qısa URL-ləri qəbul edir; base64 buraya yazılmır.
            applyAvatarToUI(dataUrl);
            showToast("Profil şəkli uğurla yeniləndi!");
        } catch (err) {
            console.error("Şəkil yükləmə xətası:", err);
            showToast(err.message || "Şəkil yüklənərkən xəta baş verdi.");
        } finally {
            input.value = '';
        }
    };

    ['avatarUpload', 'profile-image-upload'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('change', () => handleAvatarSelection(input));
    });

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            if (!currentUser) return;
            
            const fname = cleanText(document.getElementById('profFirstName').value);
            const lname = cleanText(document.getElementById('profLastName').value);
            const phone = cleanText(document.getElementById('profPhone').value, 20);
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

    // Naviqasiyada və mobil menyuda təkrarlanan elementlər sinif üzrə idarə olunur.
    const setAuthVisibility = (signedIn) => {
        document.querySelectorAll('.auth-guest-only').forEach(el => { el.hidden = signedIn; });
        document.querySelectorAll('.auth-user-only').forEach(el => { el.hidden = !signedIn; });
    };

    auth.onAuthStateChanged(user => {
        currentUser = user;
        setAuthVisibility(!!user);
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
            const profilePageAvatarText = document.getElementById('profilePageAvatarText');
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

            // Otaqları yüklə — yalnız bu istifadəçinin otaqları serverdən gətirilir,
            // beləliklə bütün otaqların məlumatı brauzerə düşmür.
            const ICON_ENTER = 'M14 5l7 7m0 0l-7 7m7-7H3';
            const ICON_TRASH = 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';

            const iconButton = (pathD, className, title) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = className;
                btn.title = title;
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'w-5 h-5');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('viewBox', '0 0 24 24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('d', pathD);
                svg.appendChild(path);
                btn.appendChild(svg);
                return btn;
            };

            // Otaq kartı DOM API ilə qurulur: baza məlumatı heç vaxt HTML kimi şərh edilmir.
            const buildRoomCard = (roomId, room) => {
                const card = document.createElement('div');
                card.className = 'room-card bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group';

                const info = document.createElement('div');
                const code = document.createElement('div');
                code.className = 'text-[#FF014C] font-bold tracking-widest text-lg';
                code.textContent = roomId;
                const meta = document.createElement('div');
                meta.className = 'text-xs text-gray-500';
                const platform = room.creator.platform || 'Bilinmir';
                const date = new Date(room.creator.createdAt || Date.now()).toLocaleDateString('az-AZ');
                meta.textContent = `${platform} • ${date}`;
                info.appendChild(code);
                info.appendChild(meta);

                const actions = document.createElement('div');
                actions.className = 'flex items-center gap-2';

                const enterBtn = iconButton(ICON_ENTER, 'p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors', 'Otağa daxil ol');
                enterBtn.addEventListener('click', () => {
                    window.location.href = 'room.html?id=' + encodeURIComponent(roomId);
                });

                const deleteBtn = iconButton(ICON_TRASH, 'p-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors border border-red-900/50 hover:border-red-600', 'Otağı sil');
                deleteBtn.addEventListener('click', () => window.deleteRoom(roomId));

                actions.appendChild(enterBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(info);
                card.appendChild(actions);
                return card;
            };

            userRoomsRef = database.ref('rooms').orderByChild('creator/uid').equalTo(user.uid);
            userRoomsRef.on('value', snapshot => {
                const rooms = snapshot.val();
                const containers = [
                    document.getElementById('profileActiveRoomsList'),
                    document.getElementById('profileRoomsList')
                ].filter(Boolean);

                containers.forEach(container => {
                    container.textContent = '';
                    let hasRoom = false;

                    for (const roomId in rooms) {
                        const room = rooms[roomId];
                        if (!room || !room.creator) continue;
                        hasRoom = true;
                        container.appendChild(buildRoomCard(roomId, room));
                    }

                    if (!hasRoom) {
                        const empty = document.createElement('div');
                        empty.className = 'text-sm text-gray-500 py-4 text-center';
                        empty.textContent = 'Aktiv otaq tapılmadı.';
                        container.appendChild(empty);
                    }
                });
            });
            
            // Profil form məlumatlarını doldur
            database.ref('users/' + user.uid).get().then(snapshot => {
                const data = snapshot.val();
                const pageName = document.getElementById('profilePageName');
                const pageLoading = document.getElementById('profilePageLoading');
                
                if (pageLoading) pageLoading.style.display = 'none';
                
                if (data) {
                    if (pageName) {
                        pageName.textContent = data.displayName || user.displayName || user.email.split('@')[0];
                        pageName.classList.remove('hidden');
                    }

                    // Avatar bazada saxlanılır (Auth photoURL uzunluq limiti səbəbindən).
                    if (data.photoURL) applyAvatarToUI(data.photoURL);

                    const fnameInput = document.getElementById('profFirstName');
                    if (fnameInput && data.displayName) {
                        const parts = data.displayName.split(' ');
                        fnameInput.value = parts[0];
                        const lnameInput = document.getElementById('profLastName');
                        if (lnameInput) lnameInput.value = parts.slice(1).join(' ');
                    }
                    const uEmail = document.getElementById('profEmail');
                    if (uEmail) uEmail.value = user.email || data.email || '';
                    const uPhone = document.getElementById('profPhone');
                    if (uPhone) uPhone.value = data.phone || '';
                    const uGender = document.getElementById('profGender');
                    if (uGender && data.gender) uGender.value = data.gender;
                    
                    const authMethod = document.getElementById('profAuthMethod');
                    if (authMethod && user.providerData && user.providerData.length > 0) {
                        const providerId = user.providerData[0].providerId;
                        if (providerId === 'password') {
                            authMethod.innerHTML = `
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <span>E-poçt ilə giriş</span>
                            `;
                        } else if (providerId === 'google.com') {
                            authMethod.innerHTML = `
                                <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                <span class="text-white">Google ilə giriş</span>
                            `;
                            const emailChangeContainer = document.getElementById('emailChangeContainer');
                            if (emailChangeContainer) emailChangeContainer.style.display = 'none';
                        }
                    }
                } else {
                    if (pageName) pageName.style.display = 'none';
                }
            }).catch(err => {
                const pageName = document.getElementById('profilePageName');
                const pageLoading = document.getElementById('profilePageLoading');
                if (pageLoading) pageLoading.style.display = 'none';
                if (pageName) pageName.style.display = 'none';
            });

        } else {
            // Yalnız hesab sahibinə aid səhifələr qonaq üçün açıq qalmamalıdır.
            if (/profile\.html$/.test(window.location.pathname)) {
                window.location.replace('index.html');
                return;
            }

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
            if (!confirmDelete) return;

            try {
                const uid = currentUser.uid;

                // İstifadəçinin yaratdığı otaqları tap (dashboard siyahısı üçün
                // istifadə olunan eyni sorğu) və hər birini sil — bu, içindəki
                // viewers/messages/signaling/playerState-i avtomatik kaskadla silir.
                // Qeyd: başqalarının otaqlarında qalan mesaj/izləyici qeydləri
                // toxunulmur — bunları tapmaq üçün bazada indeks yoxdur və tam
                // skan bahalı/mövcud təhlükəsizlik qaydaları ilə bloklana bilər.
                const ownedRoomsSnap = await database.ref('rooms')
                    .orderByChild('creator/uid').equalTo(uid).get();
                const ownedRooms = ownedRoomsSnap.val() || {};
                await Promise.all(
                    Object.keys(ownedRooms).map(roomId => database.ref('rooms/' + roomId).remove())
                );

                await database.ref('users/' + uid).remove();
                await currentUser.delete();
                await auth.signOut();

                window.location.replace('index.html');
            } catch (error) {
                showToast(getErrorMessage(error.code));
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


    // Event delegation for "Create Room" buttons
    document.addEventListener('click', (e) => {
        const createBtn = e.target.closest('#create-room-btn, .create-room-btn');
        if (createBtn) {
            e.preventDefault();
            if (!currentUser) {
                showModal(loginModal);
                return;
            }
            
            const roomCode = generateRoomCode();
            const defaultPlatform = "netflix"; // Default
            
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
        }
    });

        if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';
            if (!code) return showToast("Otaq kodunu daxil edin.");
            window.location.href = `room.html?id=${code}`;
        });
    }
});
