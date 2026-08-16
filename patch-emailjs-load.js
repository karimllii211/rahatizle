const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const regex = /emailjs\.send\("service_9umksl7",\s*"template_0aiimmq",\s*\{([\s\S]*?)\},\s*"-joV9uOaw310_PJCg"\)\s*\.then\(function\(response\)\s*\{[\s\S]*?\}\);/m;

const replacement = `const sendEmail = () => {
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
        }`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('app.js', content);
    console.log("Successfully patched EmailJS dynamic load!");
} else {
    console.log("Regex did not match!");
}
