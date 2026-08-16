const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// Update requestPasswordResetCode
const oldRequestLogic = /\/\/ Şifrə bərpası: kodu server yaradır və göndərir\.[\s\S]*?\/\/ E-poçt dəyişmə axını/;
const newRequestLogic = `// --- EMAILJS ŞİFRƏ BƏRPASI (FRONTEND) ---
    const requestPasswordResetCode = async (userEmail) => {
        currentOTPRecoveryEmail = userEmail;
        enteredResetCode = null;
        
        // 6 rəqəmli kod generasiya edirik
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        resetToken = otpCode; // Kodu yadda saxlayırıq (frontend yoxlanışı üçün)
        
        showToast("E-poçt göndərilir, zəhmət olmasa gözləyin...");
        
        try {
            await emailjs.send("service_9umksl7", "template_0aiimmq", {
                security_code: otpCode,
                email: userEmail
            }, "-joV9uOaw310_PJCg");
            
            showToast("6 rəqəmli kod e-poçtunuza göndərildi!");
            openOTPModal();
        } catch (error) {
            console.error("EmailJS Xətası:", error);
            showToast("Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        }
    };

    // E-poçt dəyişmə axını`;

content = content.replace(oldRequestLogic, newRequestLogic);

// Update verifyOTPBtn logic
content = content.replace(/if \(!resetToken\) return showToast\("Sessiyanın vaxtı bitib\. Yeni kod tələb edin\."\);[\s\S]*?enteredResetCode = entered;/g, 
`if (!resetToken) return showToast("Sessiyanın vaxtı bitib. Yeni kod tələb edin.");
                if (entered !== resetToken) return showToast("Kod yanlışdır.");
                enteredResetCode = entered;`);

// Update setNewPasswordBtn logic
const oldSetPwdLogic = /setNewPasswordBtn\.disabled = true;[\s\S]*?if \(response\.status === 400\) {/g;
const newSetPwdLogic = `setNewPasswordBtn.disabled = true;
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
                    if (response.status === 400) {`;

content = content.replace(oldSetPwdLogic, newSetPwdLogic);

// Also we need to make sure emailjs is initialized globally if needed, 
// actually emailjs.send includes the public key so it works without init.
// But let's add emailjs init at the top just in case.
if (!content.includes('emailjs.init')) {
    content = `// EmailJS Initialization
if (typeof emailjs !== 'undefined') {
    emailjs.init("-joV9uOaw310_PJCg");
}
` + content;
}

fs.writeFileSync('app.js', content);
