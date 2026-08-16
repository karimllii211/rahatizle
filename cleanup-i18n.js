const fs = require('fs');

// Read dictionary AZ
let i18nContent = '';
try {
    i18nContent = fs.readFileSync('i18n.js', 'utf8');
} catch (e) {
    console.error("No i18n.js found, skipping dict load.");
}

let dictStr = i18nContent.match(/const dict = (\{[\s\S]*?\n\});\n\nconst placeholders/);
let azDict = {};
if (dictStr) {
    let dictObj = eval('(' + dictStr[1] + ')');
    azDict = dictObj.AZ;
} else {
    // Fallback if regex fails
    azDict = {
        toast_enter_email: "E-poçt daxil edin!",
        toast_email_sending: "E-poçt göndərilir, zəhmət olmasa gözləyin...",
        toast_code_sent: "6 rəqəmli kod e-poçtunuza göndərildi!",
        toast_code_failed: "Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.",
        toast_emailjs_error: "Xəta: EmailJS yüklənə bilmədi. İnternet bağlantınızı və ya brauzer icazələrini (CSP/AdBlock) yoxlayın.",
        toast_network_error: "Şəbəkə xətası baş verdi.",
        toast_google_email_fixed: "Google hesablarının e-poçtu dəyişdirilə bilməz.",
        toast_enter_password: "Şifrəni daxil edin.",
        toast_security_passed: "Təhlükəsizlik təsdiqləndi. İndi yeni e-poçtu yaza bilərsiniz.",
        toast_wrong_password: "Şifrə yanlışdır və ya xəta baş verdi.",
        toast_enter_new_email: "Yeni e-poçt daxil edin!",
        toast_email_updated: "E-poçtunuz uğurla yeniləndi!",
        toast_enter_6_digit: "6 rəqəmli kodu daxil edin.",
        toast_session_expired: "Sessiyanın vaxtı bitib. Yeni kod tələb edin.",
        toast_wrong_code: "Kod yanlışdır.",
        toast_set_new_password: "Yeni şifrənizi təyin edin.",
        toast_pwd_length: "Şifrə ən azı 8 simvol olmalıdır.",
        toast_pwd_updated: "Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz.",
        toast_pwd_update_failed: "Şifrə yenilənə bilmədi.",
        toast_enter_email_pwd: "E-poçt və şifrəni daxil edin.",
        toast_register_first: "Zəhmət olmasa əvvəlcə qeydiyyatdan keçin.",
        toast_login_success: "Uğurla daxil oldunuz!",
        toast_register_success: "Uğurla qeydiyyatdan keçdiniz!",
        toast_fill_all: "Zəhmət olmasa bütün xanaları doldurun!",
        toast_pwds_not_match: "Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin.",
        toast_avatar_updated: "Profil şəkli uğurla yeniləndi!",
        toast_avatar_failed: "Şəkil yüklənərkən xəta baş verdi.",
        toast_name_required: "Ad mütləqdir!",
        toast_data_saved: "Məlumatlar yadda saxlanıldı!",
        toast_room_deleted: "Otaq silindi.",
        toast_room_create_failed: "Otaq yaradılarkən xəta baş verdi.",
        toast_enter_room_code: "Otaq kodunu daxil edin.",
        active_viewers: "Aktiv İzləyici",
        alert_video_format: "Videonun axına çevrilməsi uğursuz oldu. Fərqli format yoxlayın.",
        file_size_limit: "Faylın həcmi 500MB-dan böyük ola bilməz!",
        yt_search_error: "Axtarış zamanı xəta baş verdi."
    };
}

const replaceTCalls = (content) => {
    return content.replace(/\bt\(['"]([^'"]+)['"]\)/g, (match, key) => {
        return azDict[key] ? `"${azDict[key]}"` : `"${key}"`;
    });
};

// Clean app.js
let appJs = fs.readFileSync('app.js', 'utf8');
appJs = replaceTCalls(appJs);

// Remove the getErrorMessage switch case overrides if any, or just leave them since they are now strings
const errMapRegex = /switch \(errorCode\) \{[\s\S]*?return "Bir xəta baş verdi\.";\n    \}/;
const cleanErrMap = `switch (errorCode) {
        case 'auth/invalid-email': return "Geçərsiz e-poçt ünvanı.";
        case 'auth/user-disabled': return "İstifadəçi hesabı deaktiv edilib.";
        case 'auth/user-not-found': return "İstifadəçi tapılmadı.";
        case 'auth/wrong-password': return "Şifrə yanlışdır.";
        case 'auth/email-already-in-use': return "Bu e-poçt artıq istifadə olunur.";
        case 'auth/weak-password': return "Şifrə çox zəifdir (ən az 6 simvol).";
        case 'auth/too-many-requests': return "Həddən artıq cəhd! Bir az sonra yenidən yoxlayın.";
        default: return "Bir xəta baş verdi.";
    }`;
appJs = appJs.replace(errMapRegex, cleanErrMap);
fs.writeFileSync('app.js', appJs);

// Clean room.js
let roomJs = fs.readFileSync('room.js', 'utf8');
roomJs = replaceTCalls(roomJs);
// Fix the active_viewers template literal
roomJs = roomJs.replace(/\$\{"Aktiv İzləyici"\}/g, "Aktiv İzləyici");

// Remove the window.addEventListener('langChanged') block
roomJs = roomJs.replace(/window\.addEventListener\('langChanged', \(\) => \{[\s\S]*?\}\);\n/m, '');
fs.writeFileSync('room.js', roomJs);

// Clean HTML files
['index.html', 'room.html'].forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/ data-i18n="[^"]+"/g, '');
    html = html.replace(/ data-i18n-placeholder="[^"]+"/g, '');
    html = html.replace(/<script defer src="i18n\.js"><\/script>\n?/g, '');
    // remove the language select block
    html = html.replace(/<select class="lang-select[^>]+>[\s\S]*?<\/select>/g, '');
    fs.writeFileSync(file, html);
});

// Remove i18n.js
if (fs.existsSync('i18n.js')) {
    fs.unlinkSync('i18n.js');
}

console.log("Cleanup complete.");
