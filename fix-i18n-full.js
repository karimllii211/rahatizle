const fs = require('fs');

const i18nContent = `
const dict = {
    AZ: {
        "yt_search_btn": "Axtar",
        "close_video": "VİDEONU BAĞLA",
        "leave_room": "Çıx",
        "delete_room": "Otağı Sil",
        "chat_title": "Canlı Chat",
        "file_size_limit": "Faylın həcmi 500MB-dan böyük ola bilməz!",
        "video_screen": "VİDEO EKRANI",
        "upload_local": "Cihazdan yüklə",
        "chat_empty": "Otağa qoşuldunuz. Mesaj yaza bilərsiniz...",
        "active_viewers": "Aktiv İzləyici",
        "alert_video_format": "Videonun axına çevrilməsi uğursuz oldu. Fərqli format yoxlayın.",
        "yt_search_error": "Axtarış zamanı xəta baş verdi.",
        "confirm_delete": "Bu otağı birdəfəlik silmək istədiyinizə əminsiniz?",
        "host_left": "Otaq sahibi yayımı dayandırdı və ya çıxdı.",
        "room_deleted": "Otaq sahibi tərəfindən silindi.",
        "error_occurred": "Xəta baş verdi.",
        "unsupported_format": "Bu format dəstəklənmir.",
        
        "login": "Giriş",
        "register": "Qeydiyyat",
        "create_room": "Otaq Yarat",
        "join_room": "Otağa Qoşul",
        "profile": "Profil",
        "forgot_password": "Şifrəni unutmusunuz?",
        "login_with_google": "Google ilə Giriş",
        "register_with_google": "Google ilə Qeydiyyat",
        "back_to_login": "Geri qayıdıb giriş et",
        "password_recovery": "Şifrənin Bərpası",
        "recovery_desc": "Qeydiyyatdan keçdiyiniz e-poçt ünvanını daxil edin. Sizə bərpa kodu göndəriləcək.",
        "send": "Göndər",
        "password_reset": "ŞİFRƏNİ SIFIRLAMA",
        "otp_sent": "E-poçtunuza 6 rəqəmli kod göndərildi.",
        "verify_code": "Kodu Təsdiqlə",
        "resend_code": "Kodu yenidən göndər",
        "update_password": "Şifrəni Yenilə",
        "attention": "Diqqət",
        "confirm_action": "Bu əməliyyatı etmək istədiyinizə əminsiniz?",
        "no": "Xeyr",
        "yes": "Bəli"
    },
    TR: {
        "yt_search_btn": "Ara",
        "close_video": "VİDEOYU KAPAT",
        "leave_room": "Çık",
        "delete_room": "Odayı Sil",
        "chat_title": "Canlı Sohbet",
        "file_size_limit": "Dosya boyutu 500MB'ı aşamaz!",
        "video_screen": "VİDEO EKRANI",
        "upload_local": "Cihazdan yükle",
        "chat_empty": "Odaya katıldınız. Mesaj yazabilirsiniz...",
        "active_viewers": "Aktif İzleyici",
        "alert_video_format": "Videonun yayına dönüştürülmesi başarısız oldu. Farklı bir format deneyin.",
        "yt_search_error": "Arama sırasında bir hata oluştu.",
        "confirm_delete": "Bu odayı kalıcı olarak silmek istediğinize emin misiniz?",
        "host_left": "Oda sahibi yayını durdurdu veya ayrıldı.",
        "room_deleted": "Oda sahibi tarafından silindi.",
        "error_occurred": "Bir hata oluştu.",
        "unsupported_format": "Bu format desteklenmiyor.",

        "login": "Giriş Yap",
        "register": "Kayıt Ol",
        "create_room": "Oda Oluştur",
        "join_room": "Odaya Katıl",
        "profile": "Profil",
        "forgot_password": "Şifrenizi mi unuttunuz?",
        "login_with_google": "Google ile Giriş Yap",
        "register_with_google": "Google ile Kayıt Ol",
        "back_to_login": "Geri dön ve giriş yap",
        "password_recovery": "Şifre Kurtarma",
        "recovery_desc": "Kayıtlı e-posta adresinizi girin. Size bir kurtarma kodu gönderilecek.",
        "send": "Gönder",
        "password_reset": "ŞİFREYİ SIFIRLA",
        "otp_sent": "E-postanıza 6 haneli kod gönderildi.",
        "verify_code": "Kodu Doğrula",
        "resend_code": "Kodu yeniden gönder",
        "update_password": "Şifreyi Güncelle",
        "attention": "Dikkat",
        "confirm_action": "Bu işlemi yapmak istediğinize emin misiniz?",
        "no": "Hayır",
        "yes": "Evet"
    },
    EN: {
        "yt_search_btn": "Search",
        "close_video": "CLOSE VIDEO",
        "leave_room": "Leave",
        "delete_room": "Delete Room",
        "chat_title": "Live Chat",
        "file_size_limit": "File size cannot exceed 500MB!",
        "video_screen": "VIDEO SCREEN",
        "upload_local": "Upload from Device",
        "chat_empty": "Joined room. You can send messages...",
        "active_viewers": "Active Viewers",
        "alert_video_format": "Failed to convert video to stream. Try a different format.",
        "yt_search_error": "An error occurred during search.",
        "confirm_delete": "Are you sure you want to permanently delete this room?",
        "host_left": "The host stopped the stream or left.",
        "room_deleted": "The room was deleted by the host.",
        "error_occurred": "An error occurred.",
        "unsupported_format": "This format is not supported.",

        "login": "Login",
        "register": "Register",
        "create_room": "Create Room",
        "join_room": "Join Room",
        "profile": "Profile",
        "forgot_password": "Forgot Password?",
        "login_with_google": "Login with Google",
        "register_with_google": "Register with Google",
        "back_to_login": "Back to login",
        "password_recovery": "Password Recovery",
        "recovery_desc": "Enter your registered email address. A recovery code will be sent.",
        "send": "Send",
        "password_reset": "RESET PASSWORD",
        "otp_sent": "A 6-digit code has been sent to your email.",
        "verify_code": "Verify Code",
        "resend_code": "Resend code",
        "update_password": "Update Password",
        "attention": "Attention",
        "confirm_action": "Are you sure you want to do this?",
        "no": "No",
        "yes": "Yes"
    },
    RU: {
        "yt_search_btn": "Искать",
        "close_video": "ЗАКРЫТЬ ВИДЕО",
        "leave_room": "Выйти",
        "delete_room": "Удалить комнату",
        "chat_title": "Живой Чат",
        "file_size_limit": "Размер файла не должен превышать 500 МБ!",
        "video_screen": "ЭКРАН ВИДЕО",
        "upload_local": "Загрузить с устройства",
        "chat_empty": "Вы присоединились к комнате. Можете писать...",
        "active_viewers": "Активные зрители",
        "alert_video_format": "Не удалось преобразовать видео в поток. Попробуйте другой формат.",
        "yt_search_error": "Произошла ошибка при поиске.",
        "confirm_delete": "Вы уверены, что хотите навсегда удалить эту комнату?",
        "host_left": "Создатель комнаты остановил трансляцию или вышел.",
        "room_deleted": "Комната была удалена создателем.",
        "error_occurred": "Произошла ошибка.",
        "unsupported_format": "Этот формат не поддерживается.",

        "login": "Войти",
        "register": "Зарегистрироваться",
        "create_room": "Создать комнату",
        "join_room": "Присоединиться",
        "profile": "Профиль",
        "forgot_password": "Забыли пароль?",
        "login_with_google": "Войти через Google",
        "register_with_google": "Регистрация через Google",
        "back_to_login": "Вернуться к входу",
        "password_recovery": "Восстановление пароля",
        "recovery_desc": "Введите ваш зарегистрированный email. Вам будет отправлен код.",
        "send": "Отправить",
        "password_reset": "СБРОС ПАРОЛЯ",
        "otp_sent": "6-значный код был отправлен на ваш email.",
        "verify_code": "Подтвердить код",
        "resend_code": "Отправить код еще раз",
        "update_password": "Обновить пароль",
        "attention": "Внимание",
        "confirm_action": "Вы уверены, что хотите это сделать?",
        "no": "Нет",
        "yes": "Да"
    }
};

const placeholders = {
    AZ: {
        "yt_search_placeholder": "YouTube-da video və ya mahnı axtarın...",
        "chat_placeholder": "Mesaj yaz...",
        "email_placeholder": "E-poçt",
        "password_placeholder": "Şifrə (ən azı 6 simvol)",
        "otp_placeholder": "Kodu daxil edin",
        "new_password_placeholder": "Yeni şifrə (ən azı 8 simvol)"
    },
    TR: {
        "yt_search_placeholder": "YouTube'da video veya şarkı ara...",
        "chat_placeholder": "Mesaj yaz...",
        "email_placeholder": "E-posta",
        "password_placeholder": "Şifre (en az 6 karakter)",
        "otp_placeholder": "Kodu girin",
        "new_password_placeholder": "Yeni şifre (en az 8 karakter)"
    },
    EN: {
        "yt_search_placeholder": "Search video or song on YouTube...",
        "chat_placeholder": "Type a message...",
        "email_placeholder": "Email",
        "password_placeholder": "Password (min 6 characters)",
        "otp_placeholder": "Enter code",
        "new_password_placeholder": "New password (min 8 characters)"
    },
    RU: {
        "yt_search_placeholder": "Ищите видео или песню на YouTube...",
        "chat_placeholder": "Напишите сообщение...",
        "email_placeholder": "Электронная почта",
        "password_placeholder": "Пароль (минимум 6 символов)",
        "otp_placeholder": "Введите код",
        "new_password_placeholder": "Новый пароль (минимум 8 символов)"
    }
};

let currentLang = localStorage.getItem('lang') || 'AZ';

function t(key) {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key;
}

window.translate = t;
window.t = t;

function updateUI() {
    const d = dict[currentLang];
    const p = placeholders[currentLang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (d[key]) {
            el.textContent = d[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (p[key]) {
            el.placeholder = p[key];
        }
    });

    window.dispatchEvent(new CustomEvent('langChanged'));
}

function setLang(lang) {
    if (dict[lang]) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        updateUI();
        
        const selectors = document.querySelectorAll('.lang-select');
        selectors.forEach(sel => sel.value = lang);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    const selectors = document.querySelectorAll('.lang-select');
    selectors.forEach(sel => {
        sel.value = currentLang;
        sel.addEventListener('change', (e) => {
            setLang(e.target.value);
        });
    });
});
`;

fs.writeFileSync('i18n.js', i18nContent);
