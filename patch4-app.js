const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const oldLogicRegex = /const requestPasswordResetCode = async \(userEmail\) => \{[\s\S]*?showToast\("Kod göndərilə bilmədi\. Zəhmət olmasa yenidən cəhd edin\."\);\s*\}/;

const newLogic = `const requestPasswordResetCode = async (userEmail) => {
        currentOTPRecoveryEmail = userEmail;
        enteredResetCode = null;
        
        // 6 rəqəmli kod generasiya edirik
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        resetToken = otpCode; // Kodu yadda saxlayırıq (frontend yoxlanışı üçün)
        
        showToast("E-poçt göndərilir, zəhmət olmasa gözləyin...");
        
        // EmailJS göndərmə prosesi
        emailjs.send("service_9umksl7", "template_0aiimmq", {
            security_code: otpCode,
            email: userEmail,
            // Ehtiyat kimi digər dəyişənləri də göndəririk ki, template ilə uyğunsuzluq olmasın
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
    }`;

if (content.match(oldLogicRegex)) {
    content = content.replace(oldLogicRegex, newLogic);
    fs.writeFileSync('app.js', content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find the block to replace");
}
