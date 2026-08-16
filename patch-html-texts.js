const fs = require('fs');

const htmlFiles = ['index.html', 'room.html'];
const translations = [
    // buttons and links
    { regex: />Giriş Yap</g, replace: ' data-i18n="login">Giriş Yap<' },
    { regex: />Giriş</g, replace: ' data-i18n="login">Giriş<' },
    { regex: />Qeydiyyatdan Keç</g, replace: ' data-i18n="register">Qeydiyyatdan Keç<' },
    { regex: />Qeydiyyat</g, replace: ' data-i18n="register">Qeydiyyat<' },
    { regex: />Otaq Yarat</g, replace: ' data-i18n="create_room">Otaq Yarat<' },
    { regex: />Otağa Qoşul</g, replace: ' data-i18n="join_room">Otağa Qoşul<' },
    { regex: />Profil</g, replace: ' data-i18n="profile">Profil<' },
    { regex: />Şifrəni unutmusunuz\?</g, replace: ' data-i18n="forgot_password">Şifrəni unutmusunuz?<' },
    { regex: />Google ilə Giriş</g, replace: ' data-i18n="login_with_google">Google ilə Giriş<' },
    { regex: />Google ilə Qeydiyyat</g, replace: ' data-i18n="register_with_google">Google ilə Qeydiyyat<' },
    { regex: />Geri qayıdıb giriş et</g, replace: ' data-i18n="back_to_login">Geri qayıdıb giriş et<' },
    
    // modals
    { regex: />Şifrənin Bərpası</g, replace: ' data-i18n="password_recovery">Şifrənin Bərpası<' },
    { regex: />Qeydiyyatdan keçdiyiniz e-poçt ünvanını daxil edin\. Sizə bərpa kodu göndəriləcək\.</g, replace: ' data-i18n="recovery_desc">Qeydiyyatdan keçdiyiniz e-poçt ünvanını daxil edin. Sizə bərpa kodu göndəriləcək.<' },
    { regex: />Göndər</g, replace: ' data-i18n="send">Göndər<' },
    { regex: />ŞİFRƏNİ SIFIRLAMA</g, replace: ' data-i18n="password_reset">ŞİFRƏNİ SIFIRLAMA<' },
    { regex: />E-poçtunuza 6 rəqəmli kod göndərildi\.</g, replace: ' data-i18n="otp_sent">E-poçtunuza 6 rəqəmli kod göndərildi.<' },
    { regex: />Kodu Təsdiqlə</g, replace: ' data-i18n="verify_code">Kodu Təsdiqlə<' },
    { regex: />Kodu yenidən göndər</g, replace: ' data-i18n="resend_code">Kodu yenidən göndər<' },
    { regex: />Şifrəni Yenilə</g, replace: ' data-i18n="update_password">Şifrəni Yenilə<' },
    
    // Attention modal
    { regex: />Diqqət</g, replace: ' data-i18n="attention">Diqqət<' },
    { regex: />Bu əməliyyatı etmək istədiyinizə əminsiniz\?</g, replace: ' data-i18n="confirm_action">Bu əməliyyatı etmək istədiyinizə əminsiniz?<' },
    { regex: />Xeyr</g, replace: ' data-i18n="no">Xeyr<' },
    { regex: />Bəli</g, replace: ' data-i18n="yes">Bəli<' },

    // placeholders
    { regex: /placeholder="E-poçt"/g, replace: 'placeholder="E-poçt" data-i18n-placeholder="email_placeholder"' },
    { regex: /placeholder="Şifrə \(ən azı 6 simvol\)"/g, replace: 'placeholder="Şifrə (ən azı 6 simvol)" data-i18n-placeholder="password_placeholder"' },
    { regex: /placeholder="Kodu daxil edin"/g, replace: 'placeholder="Kodu daxil edin" data-i18n-placeholder="otp_placeholder"' },
    { regex: /placeholder="Yeni şifrə \(ən azı 8 simvol\)"/g, replace: 'placeholder="Yeni şifrə (ən azı 8 simvol)" data-i18n-placeholder="new_password_placeholder"' }
];

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Avoid double tagging by first stripping some bad tagging if it already happened
    // Just a basic check: if it doesn't have data-i18n, we replace.
    // We'll use a slightly more complex regex to avoid double tagging if needed, 
    // but a simple approach: just apply where missing.
    
    translations.forEach(tr => {
        // Look for >Text< without data-i18n
        // This is tricky with simple string replacement. We do it manually:
        // Ex: `>Giriş<` -> ` data-i18n="login">Giriş<`
        // We only replace if there isn't already `data-i18n="login">Giriş<`
        
        let splitContent = content.split(tr.regex);
        let newContent = splitContent[0];
        
        for (let i = 1; i < splitContent.length; i++) {
            // Check if the previous part ends with data-i18n="something"
            if (!splitContent[i-1].endsWith('"')) {
                newContent += tr.replace + splitContent[i];
            } else {
                newContent += tr.regex.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\$/g, '').slice(1, -2) + splitContent[i]; // Restore if skipped, hacky but works for this specific case
            }
        }
        
        // simpler approach:
        content = content.replace(tr.regex, tr.replace);
    });
    
    // Clean up duplicate data-i18n inside tags just in case
    content = content.replace(/data-i18n="[^"]+"\s+data-i18n="/g, 'data-i18n="');
    
    // Ensure meta charset UTF-8 is present
    if (!content.includes('<meta charset="UTF-8">') && !content.includes('<meta charset="utf-8">')) {
        content = content.replace(/<head>/i, '<head>\n    <meta charset="UTF-8">');
    }
    
    fs.writeFileSync(file, content);
});

console.log("Patched HTML files with i18n tags");
