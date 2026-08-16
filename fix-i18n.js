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
        "unsupported_format": "Bu format dəstəklənmir."
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
        "unsupported_format": "Bu format desteklenmiyor."
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
        "unsupported_format": "This format is not supported."
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
        "unsupported_format": "Этот формат не поддерживается."
    }
};

const placeholders = {
    AZ: {
        "yt_search_placeholder": "YouTube-da video və ya mahnı axtarın...",
        "chat_placeholder": "Mesaj yaz..."
    },
    TR: {
        "yt_search_placeholder": "YouTube'da video veya şarkı ara...",
        "chat_placeholder": "Mesaj yaz..."
    },
    EN: {
        "yt_search_placeholder": "Search video or song on YouTube...",
        "chat_placeholder": "Type a message..."
    },
    RU: {
        "yt_search_placeholder": "Ищите видео или песню на YouTube...",
        "chat_placeholder": "Напишите сообщение..."
    }
};

let currentLang = localStorage.getItem('app_lang') || 'AZ';

function t(key) {
    if (dict[currentLang] && dict[currentLang][key]) {
        return dict[currentLang][key];
    }
    return key;
}

window.t = t;

function applyLang() {
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

    // Update dynamic global elements if needed by firing a custom event
    window.dispatchEvent(new CustomEvent('langChanged'));
}

function setLang(lang) {
    if (dict[lang]) {
        currentLang = lang;
        localStorage.setItem('app_lang', lang);
        applyLang();
        
        const selectors = document.querySelectorAll('.lang-select');
        selectors.forEach(sel => sel.value = lang);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyLang();
    
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
