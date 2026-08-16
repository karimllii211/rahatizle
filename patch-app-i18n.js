const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// Replace showToast("string") with showToast(t("toast_key"))
const replacements = [
    { old: '"E-poçt daxil edin!"', key: 'toast_enter_email' },
    { old: '"E-poçt göndərilir, zəhmət olmasa gözləyin..."', key: 'toast_email_sending' },
    { old: '"6 rəqəmli kod e-poçtunuza göndərildi!"', key: 'toast_code_sent' },
    { old: '"Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin."', key: 'toast_code_failed' },
    { old: '"Xəta: EmailJS yüklənə bilmədi. İnternet bağlantınızı və ya brauzer icazələrini (CSP/AdBlock) yoxlayın."', key: 'toast_emailjs_error' },
    { old: '"Şəbəkə xətası baş verdi."', key: 'toast_network_error' },
    { old: '"Google hesablarının e-poçtu dəyişdirilə bilməz."', key: 'toast_google_email_fixed' },
    { old: '"Şifrəni daxil edin."', key: 'toast_enter_password' },
    { old: '"Təhlükəsizlik təsdiqləndi. İndi yeni e-poçtu yaza bilərsiniz."', key: 'toast_security_passed' },
    { old: '"Şifrə yanlışdır və ya xəta baş verdi."', key: 'toast_wrong_password' },
    { old: '"Yeni e-poçt daxil edin!"', key: 'toast_enter_new_email' },
    { old: '"E-poçtunuz uğurla yeniləndi!"', key: 'toast_email_updated' },
    { old: '"6 rəqəmli kodu daxil edin."', key: 'toast_enter_6_digit' },
    { old: '"Sessiyanın vaxtı bitib. Yeni kod tələb edin."', key: 'toast_session_expired' },
    { old: '"Kod yanlışdır."', key: 'toast_wrong_code' },
    { old: '"Yeni şifrənizi təyin edin."', key: 'toast_set_new_password' },
    { old: '"Şifrə ən azı 8 simvol olmalıdır."', key: 'toast_pwd_length' },
    { old: '"Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz."', key: 'toast_pwd_updated' },
    { old: '"Şifrə yenilənə bilmədi."', key: 'toast_pwd_update_failed' },
    { old: '"E-poçt və şifrəni daxil edin."', key: 'toast_enter_email_pwd' },
    { old: '"Zəhmət olmasa əvvəlcə qeydiyyatdan keçin."', key: 'toast_register_first' },
    { old: '"Uğurla daxil oldunuz!"', key: 'toast_login_success' },
    { old: '"Uğurla qeydiyyatdan keçdiniz!"', key: 'toast_register_success' },
    { old: '"Zəhmət olmasa bütün xanaları doldurun!"', key: 'toast_fill_all' },
    { old: '"Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin."', key: 'toast_pwds_not_match' },
    { old: '"Şifrə ən azı 8 simvol olmalıdır!"', key: 'toast_pwd_length' },
    { old: '"Profil şəkli uğurla yeniləndi!"', key: 'toast_avatar_updated' },
    { old: '"Şəkil yüklənərkən xəta baş verdi."', key: 'toast_avatar_failed' },
    { old: '"Ad mütləqdir!"', key: 'toast_name_required' },
    { old: '"Məlumatlar yadda saxlanıldı!"', key: 'toast_data_saved' },
    { old: '"Otaq silindi."', key: 'toast_room_deleted' },
    { old: '"Otaq yaradılarkən xəta baş verdi."', key: 'toast_room_create_failed' },
    { old: '"Otaq kodunu daxil edin."', key: 'toast_enter_room_code' }
];

replacements.forEach(r => {
    // Replace everywhere exactly
    content = content.split(r.old).join(`t('${r.key}')`);
});

// For getErrorMessage, we should return translated messages too.
// I will just add the translations to i18n.js, and getErrorMessage can return them.
// But first let's just make getErrorMessage return t('err_' + errorCode) or similar. 
// Or I can just patch the getErrorMessage function to use t(key).
const errMapRegex = /switch \([^)]+\) \{[\s\S]*?return "Bir xəta baş verdi\.";\n    \}/;
const newErrMap = `switch (errorCode) {
        case 'auth/invalid-email': return t('err_invalid_email') || "Geçərsiz e-poçt ünvanı.";
        case 'auth/user-disabled': return t('err_user_disabled') || "İstifadəçi hesabı deaktiv edilib.";
        case 'auth/user-not-found': return t('err_user_not_found') || "İstifadəçi tapılmadı.";
        case 'auth/wrong-password': return t('err_wrong_password') || "Şifrə yanlışdır.";
        case 'auth/email-already-in-use': return t('err_email_in_use') || "Bu e-poçt artıq istifadə olunur.";
        case 'auth/weak-password': return t('err_weak_password') || "Şifrə çox zəifdir (ən az 6 simvol).";
        case 'auth/too-many-requests': return t('err_too_many') || "Həddən artıq cəhd! Bir az sonra yenidən yoxlayın.";
        default: return t('err_default') || "Bir xəta baş verdi.";
    }`;

content = content.replace(errMapRegex, newErrMap);

fs.writeFileSync('app.js', content);
