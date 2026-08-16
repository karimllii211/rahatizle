const dict = {
    AZ: {
        "yt_search_btn": "Axtar",
        "close_video": "VİDEONU BAĞLA",
        "leave_room": "Çıx",
        "delete_room": "Otağı Sil",
        "chat_title": "Canlı Chat",
        "file_size_limit": "Faylın həcmi 500MB-dan böyük ola bilməz!",
        "video_screen": "VİDEO EKRANI",
        "chat_empty": "Odaya katıldınız. Mesaj yazabilirsiniz...",
        "chat_empty": "Otağa qoşuldunuz. Mesaj yaza bilərsiniz...",
        "upload_local": "Cihazdan yükle",
        "upload_local": "Cihazdan yüklə"
    },
    TR: {
        "yt_search_btn": "Ara",
        "close_video": "VİDEOYU KAPAT",
        "leave_room": "Çık",
        "delete_room": "Odayı Sil",
        "chat_title": "Canlı Sohbet",
        "file_size_limit": "Dosya boyutu 500MB'ı aşamaz!",
        "video_screen": "VİDEO EKRANI"
    },
    EN: {
        "yt_search_btn": "Search",
        "close_video": "CLOSE VIDEO",
        "leave_room": "Leave",
        "delete_room": "Delete Room",
        "chat_title": "Live Chat",
        "file_size_limit": "File size cannot exceed 500MB!",
        "video_screen": "VIDEO SCREEN",
        "chat_empty": "Joined room. You can send messages...",
        "upload_local": "Upload from Device"
    },
    RU: {
        "yt_search_btn": "Искать",
        "close_video": "ЗАКРЫТЬ ВИДЕО",
        "leave_room": "Выйти",
        "delete_room": "Удалить комнату",
        "chat_title": "Живой Чат",
        "file_size_limit": "Размер файла не должен превышать 500 МБ!",
        "video_screen": "ЭКРАН ВИДЕО",
        "chat_empty": "Вы присоединились к комнате. Можете писать...",
        "upload_local": "Загрузить с устройства"
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

window.i18n = {
    getFileSizeLimit: () => dict[currentLang]["file_size_limit"]
};
