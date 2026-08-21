// Firebase configuration (Eyni olmalıdır)
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

let currentUser = null;
let currentRoomId = null;

// --- CUSTOM MODALS & TOASTS ---
let toastTimeout;
const showToast = (message) => {
    const toast = document.getElementById('custom-toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    toast.classList.remove('animate-toast');
    void toast.offsetWidth;
    toast.classList.add('animate-toast');


    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }, 4000);
};

const toastCloseBtn = document.getElementById('toast-close-btn');
if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
        const toast = document.getElementById('custom-toast');
        if (toast) {
            toast.classList.add('hidden');
            toast.classList.remove('flex');
        }
    });
}

const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-credential': return "E-poçt və ya şifrə yanlışdır.";
        case 'auth/email-already-in-use': return "Bu e-poçt ilə artıq qeydiyyatdan keçilib.";
        case 'auth/weak-password': return "Şifrə ən azı 6 simvol olmalıdır.";
        case 'auth/network-request-failed': return "İnternet bağlantısını yoxlayın.";
        case 'auth/requires-recent-login': return "Bu əməliyyat üçün yenidən daxil olmalısınız.";
        default: return "Bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.";
    }
};

const showConfirmModal = (message) => {
    return new Promise((resolve) => {
        const confirmModal = document.getElementById('custom-confirm');
        const confirmMessage = document.getElementById('confirm-message');
        const btnYes = document.getElementById('confirm-yes-btn');
        const btnNo = document.getElementById('confirm-no-btn');

        if (!confirmModal) return resolve(false);

        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');

        const cleanup = () => {
            confirmModal.classList.add('hidden');
            confirmModal.classList.remove('flex');
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
        };

        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };

        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    });
};

// --- EKRAN PAYLAŞIMI: Netflix / Disney+ / Prime Video rəsmi saytlarının linkləri ---
const PLATFORM_URLS = {
    netflix: 'https://www.netflix.com',
    disney: 'https://www.disneyplus.com',
    prime: 'https://www.primevideo.com'
};

// Disney+ hazırda rəsmi olaraq mövcud olan ölkələr (ISO 3166-1 alpha-2).
// DİQQƏT: Disney+ vaxtaşırı yeni ölkələr əlavə edir, bu siyahı mütəmadi
// yenilənməlidir. AZ (Azərbaycan) qəsdən bu siyahıda YOXDUR.
const DISNEY_PLUS_COUNTRIES = [
    'US', 'CA', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH',
    'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR',
    'SI', 'GR', 'LU', 'IS', 'EE', 'LV', 'LT', 'MT', 'CY', 'TR',
    'IL', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'EG', 'MA', 'ZA',
    'AU', 'NZ', 'JP', 'KR', 'HK', 'TW', 'SG', 'ID', 'MY', 'TH', 'PH', 'IN',
    'BR', 'AR', 'MX', 'CL', 'CO', 'PE', 'EC', 'UY', 'PY', 'BO', 'PA', 'CR',
    'GT', 'HN', 'SV', 'NI', 'DO', 'VE'
];

// Pulsuz IP-əsaslı geolokasiya — açar tələb etmir, CORS dəstəkləyir.
// Xəta/timeout halında sükutla `true` qaytarır ki, əsas axın pozulmasın.
async function isDisneyAvailableInUserCountry() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return true;
        const data = await response.json();
        const countryCode = data && data.country_code ? String(data.country_code).toUpperCase() : null;
        if (!countryCode) return true;
        return DISNEY_PLUS_COUNTRIES.includes(countryCode);
    } catch (err) {
        return true;
    }
}

async function handleGoToPlatform(platform) {
    const url = PLATFORM_URLS[platform];
    if (!url) return;

    if (platform === 'disney') {
        const available = await isDisneyAvailableInUserCountry();
        if (!available) {
            const proceed = await showConfirmModal('Hal-hazırda olduğunuz bölgədə Disney+ mövcud deyil. Yenə də davam etmək istəyirsiniz?');
            if (!proceed) return;
        }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
}

// Auth Guard
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.replace('index.html');
    } else {
        currentUser = user;
        initRoom();
    }
});

function initRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    currentRoomId = urlParams.get('id');

    if (!currentRoomId) {
        window.location.replace('index.html');
        return;
    }
    
    console.log("🚀 Room.js tam yükləndi. Otaq ID: ", currentRoomId);

    // UI Elements
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    const deleteRoomBtn = document.getElementById('deleteRoomBtn');
    const activeViewerCount = document.getElementById('activeViewerCount');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatEmptyState = document.getElementById('chatEmptyState');
    
    // Chat Toggles
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatPanel = document.getElementById('chatPanel');
    const videoScrollWrapper = document.getElementById('videoScrollWrapper');

    // YouTube üçün chat: sağdan açılan overlay əvəzinə videonun altında,
    // default olaraq açıq göstərilir. Digər platformalar bu overlay-i
    // olduğu kimi saxlayır — bax: setYouTubeInlineChat/restoreDefaultChatPanel.
    const chatPanelDefaultClassName = chatPanel.className;
    const chatPanelDefaultParent = chatPanel.parentElement;
    const chatPanelDefaultNextSibling = chatPanel.nextSibling;

    function setYouTubeInlineChat() {
        if (chatPanel.dataset.ytInline === '1') return;
        chatPanel.dataset.ytInline = '1';
        if (videoScrollWrapper) videoScrollWrapper.appendChild(chatPanel);
        chatPanel.className = 'relative z-30 mt-4 flex h-[420px] w-full max-w-5xl shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] shadow-[0_10px_30px_rgba(0,0,0,0.4)]';
        if (toggleChatBtn) toggleChatBtn.classList.add('hidden');
        if (closeChatBtn) closeChatBtn.classList.add('hidden');
    }

    function restoreDefaultChatPanel() {
        if (chatPanel.dataset.ytInline !== '1') return;
        delete chatPanel.dataset.ytInline;
        chatPanelDefaultParent.insertBefore(chatPanel, chatPanelDefaultNextSibling);
        chatPanel.className = chatPanelDefaultClassName;
        if (toggleChatBtn) toggleChatBtn.classList.remove('hidden');
        if (closeChatBtn) closeChatBtn.classList.remove('hidden');
    }
    
    
    
    // Chat is now handled by inline onclick in room.html


    // Mobil: sol panel (platformalar + fayl yükləmə) sürüşən çekmece kimi açılır.
    // Əvvəllər bu panel kiçik ekranlarda tamamilə gizli idi və otağı yaradan
    // telefondan video seçə bilmirdi.
    const sidePanel = document.getElementById('sidePanel');
    const openPanelBtn = document.getElementById('openPanelBtn');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const panelBackdrop = document.getElementById('panelBackdrop');

    const setPanelOpen = (open) => {
        if (!sidePanel) return;
        sidePanel.classList.toggle('-translate-x-full', !open);
        if (panelBackdrop) panelBackdrop.classList.toggle('hidden', !open);
    };

    if (openPanelBtn) openPanelBtn.addEventListener('click', () => setPanelOpen(true));
    if (closePanelBtn) closePanelBtn.addEventListener('click', () => setPanelOpen(false));
    if (panelBackdrop) panelBackdrop.addEventListener('click', () => setPanelOpen(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setPanelOpen(false);
    });
    // Panelin içindəki seçimdən sonra mobildə avtomatik bağlanır
    if (sidePanel) {
        sidePanel.addEventListener('click', (e) => {
            if (e.target.closest('.room-platform-btn') && window.innerWidth < 768) setPanelOpen(false);
        });
    }

    if (roomCodeDisplay) roomCodeDisplay.textContent = `KOD: ${currentRoomId}`;

    const changePlatformLink = document.getElementById('changePlatformLink');
    if (changePlatformLink) {
        changePlatformLink.href = 'select-platform.html?id=' + encodeURIComponent(currentRoomId);
        changePlatformLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'select-platform.html?id=' + encodeURIComponent(currentRoomId);
        });
    }

    // Video üzərindəki "Videonu Dəyiş" düyməsi — platforma seçim axınını təkrar
    // keçmədən, birbaşa YouTube axtarışına aparır (yalnız YouTube rejimində göstərilir).
    const changeVideoBtn = document.getElementById('changeVideoBtn');
    if (changeVideoBtn) {
        changeVideoBtn.href = 'youtube-search.html?id=' + encodeURIComponent(currentRoomId);
    }

    const roomRef = database.ref(`rooms/${currentRoomId}`);
    const viewersRef = database.ref(`rooms/${currentRoomId}/viewers`);
    const messagesRef = database.ref(`rooms/${currentRoomId}/messages`);
    let appliedPlatform = null;

    // 1. Otaq Məlumatını və Silinməni İzləmək
    roomRef.on('value', snapshot => {
        const data = snapshot.val();
        if (!data) {
            // Otaq silinib, hər kəsi ana səhifəyə qaytar
            window.location.replace('index.html');
            return;
        }

        // Əgər cari istifadəçi otağı yaradandırsa, sil düyməsini göstər
        if (data.creator && data.creator.uid === currentUser.uid) {
            if (deleteRoomBtn) {
                deleteRoomBtn.classList.remove('hidden');
                deleteRoomBtn.onclick = async () => {
                    const conf = await showConfirmModal("Otağı tamamilə silmək istədiyinizə əminsiniz? Hər kəs otaqdan çıxarılacaq.");
                    if (conf) {
                        Object.values(peerConnections).forEach(pc => pc.close());
                        await signalingRef.child('peers').remove();
                        roomRef.remove();
                    }
                };
            }
        }
        
                // Platformanın dəyişməsini Firebase-dən idarə et (bax: renderPlatformView, aşağıda)
        const currentPlatform = data.creator ? data.creator.platform : null;
        if (currentPlatform && currentPlatform !== appliedPlatform) {
            appliedPlatform = currentPlatform;
            renderPlatformView(currentPlatform);
        }
    });

    // 2. Presence (İzləyici Sayı) Məntiqi
    const myViewerRef = viewersRef.child(currentUser.uid);
    // İnternet kəsildikdə və ya səhifə bağlandıqda məlumatı sil
    myViewerRef.onDisconnect().remove().then(() => {
        // İndi mən daxil oldum
        myViewerRef.set({
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
    });

    // Otaqdakı izləyicilərin sayını və dairəvi avatarlarını ekranda göstərmək
    const viewerAvatarsEl = document.getElementById('viewerAvatars');
    viewersRef.on('value', snapshot => {
        const data = snapshot.val();
        const viewers = data ? Object.values(data) : [];
        if (activeViewerCount) {
            activeViewerCount.textContent = `Aktiv İzləyici: ${viewers.length}`;
        }

        if (viewerAvatarsEl) {
            viewerAvatarsEl.innerHTML = '';
            const maxShown = 5;
            viewers.slice(0, maxShown).forEach(viewer => {
                const avatar = document.createElement('div');
                avatar.className = 'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border bg-white/10 text-gray-300 border-white/20';
                avatar.title = viewer.name || '';
                avatar.textContent = viewer.name ? viewer.name.charAt(0).toUpperCase() : '?';
                viewerAvatarsEl.appendChild(avatar);
            });
            if (viewers.length > maxShown) {
                const extra = document.createElement('div');
                extra.className = 'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border bg-white/10 text-gray-300 border-white/20';
                extra.textContent = `+${viewers.length - maxShown}`;
                viewerAvatarsEl.appendChild(extra);
            }
        }
    });

    // 3. Canlı Chat Məntiqi
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim().slice(0, 500);
            if (!text) return;

            try {
                await messagesRef.push({
                    uid: currentUser.uid,
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    text: text,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                chatInput.value = '';
            } catch (err) {
                console.error("Mesaj göndərilmədi:", err);
                showToast("Mesaj göndərilmədi. İnternet bağlantınızı yoxlayın.");
            }
        });
    }

    // Mesajları oxumaq
    messagesRef.on('child_added', snapshot => {
        const message = snapshot.val();
        if (chatEmptyState) chatEmptyState.classList.add('hidden');

        const isMe = message.uid === currentUser.uid;
        
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = `flex items-end gap-2 max-w-[85%] animate-msg ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${isMe ? 'bg-red-900/30 text-white border-red-500/50' : 'bg-white/10 text-gray-300 border-white/20'}`;
        avatarDiv.textContent = message.name ? message.name.charAt(0).toUpperCase() : '?';

        const msgDiv = document.createElement('div');
        msgDiv.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-[10px] text-gray-500 mb-1 px-1 tracking-wider';
        nameSpan.textContent = isMe ? 'Sən' : message.name;

        const textDiv = document.createElement('div');
        textDiv.className = `px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-[#FF014C] text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`;
        textDiv.textContent = message.text; // html escape is safe via textContent

        msgDiv.appendChild(nameSpan);
        msgDiv.appendChild(textDiv);
        wrapperDiv.appendChild(avatarDiv);
        wrapperDiv.appendChild(msgDiv);
        chatMessages.appendChild(wrapperDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // --- 4. WebRTC (P2P) və Local Video Playback ---
    const localVideoUpload = document.getElementById('local-video-upload');
    const localVideoBtn = document.getElementById('localVideoBtn');
    const mainVideo = document.getElementById('main-video');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    
    let localStream = null;
    // GUEST: yalnız host-a tək bağlantı üçün (star topologiyasında qonağın YALNIZ bir bağlantısı var)
    let peerConnection = null;
    let pendingIceCandidates = []; // remoteDescription hələ təyin olunmayanda gələn ICE candidate-lər üçün növbə
    let isHost = false;
    let youtubeVideoActive = false;
    let screenShareStream = null; // Netflix/Disney+/Prime ekran paylaşımı (yalnız host)

    // HOST: hər qonaq üçün ayrıca RTCPeerConnection (guestUid -> RTCPeerConnection) —
    // ulduz (star) topologiyası, qonaqlar bir-biri ilə DEYİL, YALNIZ host ilə bağlanır.
    const peerConnections = {};
    const pendingIceCandidatesByGuest = {}; // guestUid -> növbələnmiş ICE candidate-lər
    const listeningForCandidatesSet = new Set(); // hansı guestUid-lər üçün candidate dinləməsi artıq aktivdir

    // "Videonu Dəyiş" / "Videonu Bağla" düymələrinin görünürlüyünü hər dəfə
    // mövcud vəziyyətdən (isHost, appliedPlatform, youtubeVideoActive) yenidən
    // hesablayır. isHost (async) və platform render/youtubeId dinləyiciləri
    // müstəqil, sıra qarantiyası olmayan Firebase sorğularıdır — ona görə hər
    // birindən sonra bunu çağırmaq, tək yerdə mutasiya etməkdənsə, düymələrin
    // həmişə düzgün son vəziyyətə düşməsini təmin edir.
    function refreshVideoActionButtons() {
        if (!changeVideoBtn || !closeVideoBtn) return;

        changeVideoBtn.classList.toggle('hidden', !(isHost && appliedPlatform === 'youtube'));

        if (!isHost) {
            if (youtubeVideoActive) closeVideoBtn.classList.add('hidden');
            return;
        }

        // closeVideoBtn Netflix/Disney+/Prime ekran paylaşımı aktiv olduqda
        // "Paylaşımı Dayandır" olaraq yenidən istifadə edilir — ayrıca düymə
        // yaratmaq əvəzinə mövcud "Videonu Bağla" mexanizmi təkrar istifadə olunur.
        const closeVideoBtnLabel = closeVideoBtn.querySelector('span');
        if (screenShareStream) {
            if (closeVideoBtnLabel) closeVideoBtnLabel.textContent = 'Paylaşımı Dayandır';
            closeVideoBtn.classList.remove('hidden');
            return;
        }
        if (closeVideoBtnLabel) closeVideoBtnLabel.textContent = 'Videonu Bağla';

        if (youtubeVideoActive) {
            closeVideoBtn.classList.remove('hidden');
        } else if (appliedPlatform === 'youtube') {
            closeVideoBtn.classList.add('hidden');
        }
        // appliedPlatform !== 'youtube' olduqda (local/digər) closeVideoBtn-ə
        // toxunmuruq — onun görünürlüyü local video yükləmə/bağlama axınında
        // (aşağıda) idarə olunur.
    }

    // Safari-nin avtomatik-oxutma siyasəti istifadəçi toxunuşu olmadan play()-i
    // rədd edir. Bu, həm ilk stream alındıqda, həm də sinxronizasiya vasitəsilə
    // reaktiv şəkildə play çağırıldıqda baş verə bilər — hər iki yerdə eyni
    // bərpa düyməsi göstərilir.
    function showManualPlayButton(videoEl) {
        let playBtn = document.getElementById('safariPlayBtn');
        if (!playBtn) {
            playBtn = document.createElement('button');
            playBtn.id = 'safariPlayBtn';
            playBtn.className = 'absolute z-50 bg-[#FF014C] hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl tracking-widest uppercase transition-all duration-300';
            playBtn.innerText = 'Videonu Başlatmaq üçün Toxunun';
            videoEl.parentElement.appendChild(playBtn);

            const playVideoHandler = (e) => {
                e.preventDefault();
                const userPlayPromise = videoEl.play();
                if (userPlayPromise !== undefined) {
                    userPlayPromise.then(() => {
                        playBtn.style.display = 'none';
                    }).catch(err => console.error("Toxunma ilə oynatma xətası:", err));
                } else {
                    playBtn.style.display = 'none';
                }
            };
            playBtn.addEventListener('click', playVideoHandler);
            playBtn.addEventListener('touchstart', playVideoHandler, { passive: false });
        }
        playBtn.style.display = 'block';
    }

    // Fayl seçimi inline `onclick` əvəzinə burada bağlanır (CSP üçün təhlükəsizdir).
    if (localVideoBtn && localVideoUpload) {
        localVideoBtn.addEventListener('click', () => {
            if (!isHost) return showToast("Yalnız otağı yaradan video yükləyə bilər.");
            if (videoPlaceholder) {
                videoPlaceholder.classList.remove('hidden');
                videoPlaceholder.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                        <svg class="h-20 w-20 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                        <span class="text-xl font-bold tracking-wider text-white" style="filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));">500MB LİMİT</span>
                    </div>
                `;
            }
            if (mainVideo) mainVideo.classList.add('hidden');
            localVideoUpload.click();
        });
    }

    // TURN məlumatları brauzerə çatmalıdır, ona görə də gizli sayıla bilməz.
    // Uzunmüddətli sabit parol əvəzinə serverdən qısamüddətli (ephemeral) TURN
    // məlumatı verilməsi tövsiyə olunur — bax: RFC 8489 / coturn REST API.
    // Dəyərlər window.RAHATIZLE_TURN vasitəsilə əvəz edilə bilər.
    const turn = window.RAHATIZLE_TURN || {};
    const configuration = {
        sdpSemantics: 'unified-plan',
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // Standart STUN
            {
                urls: turn.url || 'turn:free.expressturn.com:3478',
                username: turn.username || '000000002102689018',
                credential: turn.credential || 'E8GD4U6RpHZcNMvfPcbANCvRQbc='
            }
        ]
    };

    const signalingRef = database.ref(`rooms/${currentRoomId}/signaling`);
    const playerStateRef = database.ref(`rooms/${currentRoomId}/playerState`);
    const videoActiveRef = database.ref(`rooms/${currentRoomId}/videoActive`);

    // Host və Guest Rollarının Ayrılması
    roomRef.child('creator').get().then(snapshot => {
        const creatorData = snapshot.val();
        if (creatorData && creatorData.uid === currentUser.uid) {
            isHost = true;
            mainVideo.controls = true;
            mainVideo.style.pointerEvents = 'auto';
            if (localVideoBtn) localVideoBtn.parentElement.classList.remove('hidden');
            
            // Otaq performansı: Host qopduqda lazımsız siqnal qalıqlarını təmizlə
            signalingRef.onDisconnect().remove();
        } else {
            isHost = false;
            mainVideo.controls = true;
            mainVideo.style.pointerEvents = 'auto';
            if (localVideoBtn) localVideoBtn.parentElement.classList.add('hidden');
            
            // Qonaq girən kimi öz offer-ini dinləyir (Dəqiq Axın B)
            listenForOffer();

            // Köhnə (əvvəlki sessiyadan qalan) candidate-ləri təmizlə — yalnız ÖZ yolumuz
            signalingRef.child('peers').child(currentUser.uid).child('candidates').remove();
        }
        
        console.log("👤 Mənim Rolum: ", isHost ? "HOST" : "GUEST");
        refreshVideoActionButtons();

        // isHost bu an müəyyənləşir (async), amma Netflix/Disney+/Prime
        // placeholder-i (loqo + "keç"/"Ekranı Paylaş" düymələri) daha ERKƏN,
        // isHost hələ `false` olarkən artıq render olunmuş ola bilər (bax:
        // platformHint bloku və ya roomRef.on('value') — hər ikisi bu sətirdən
        // ƏVVƏL işə düşə bilər). Həmin ilkin render-də host düymələri əlavə
        // olunmayıb və heç bir click listener bağlanmayıb. isHost=true olduqda
        // eyni platforma üçün YENİDƏN render etməsək, host düymələri HEÇ VAXT
        // görünmür. appliedPlatform dəyişməzsə roomRef.on('value') ikinci dəfə
        // renderPlatformView çağırmır (currentPlatform === appliedPlatform),
        // ona görə bu, yeganə düzgün "refresh" nöqtəsidir.
        if (isHost && appliedPlatform && logos[appliedPlatform]) {
            renderPlatformPlaceholderContent(appliedPlatform);
        } else if (isHost && appliedPlatform === 'local') {
            // Eyni "gecikmiş isHost" səbəbindən 'local' üçün də: əgər bu render
            // isHost hələ `false` olarkən (qonaq gözləmə mesajı ilə) baş tutubsa,
            // isHost bilinən kimi fayl seçicini indi aç.
            if (localVideoBtn) localVideoBtn.click();
        }

        if (isHost) {
            // Ulduz (star) topologiyası: hər qonaq YALNIZ host-a bağlanır, qonaqlar
            // bir-biri ilə bağlanmır. Mövcud presence sistemini (viewersRef) yeni
            // qonaq aşkarlama üçün təkrar istifadə edirik — 'child_added' həm
            // həqiqətən YENİ qonaqda, həm də əvvəlki qonaq yenidən qoşulduqda
            // (onDisconnect().remove() + yenidən set() → node silinib-yenidən
            // yaranır) tetiklənir, ona görə köhnə ayrıca "guestTrigger" mexanizmi
            // artıq lazım deyil.
            viewersRef.on('child_added', snapshot => {
                const guestUid = snapshot.key;
                if (guestUid === currentUser.uid) return; // öz presence qeydimiz

                console.log(`👋 Yeni qonaq aşkarlandı: ${guestUid}`);
                const pc = setupPeerConnectionForGuest(guestUid);
                addCurrentStreamToPeerConnection(pc);
                sendOfferToGuest(guestUid);
            });

            viewersRef.on('child_removed', snapshot => {
                const guestUid = snapshot.key;
                if (guestUid === currentUser.uid) return;

                console.log(`👋 Qonaq ayrıldı, bağlantı təmizlənir: ${guestUid}`);
                if (peerConnections[guestUid]) {
                    peerConnections[guestUid].close();
                    delete peerConnections[guestUid];
                }
                delete pendingIceCandidatesByGuest[guestUid];
                listeningForCandidatesSet.delete(guestUid);
                signalingRef.child('peers').child(guestUid).remove();
            });
        }
    });

    // GUEST: host-a tək bağlantı qurur. Yalnız qonaq tərəfdə çağırılır (bax: listenForOffer).
    // HOST tərəfin ekvivalenti üçün bax: setupPeerConnectionForGuest (aşağıda).
    const setupPeerConnection = () => {
        if (peerConnection) return;

        pendingIceCandidates = []; // yeni bağlantı — köhnə növbələnmiş candidate-lər etibarsızdır

        peerConnection = new RTCPeerConnection(configuration);

        // Diaqnostik: signalingState keçidlərini izləmək üçün (debug məqsədilə saxlanılır)
        peerConnection.onsignalingstatechange = () => console.log('Signaling state dəyişdi:', peerConnection.signalingState);

        // Diaqnostik: ICE candidate xətalarını izləmək üçün (debug məqsədilə saxlanılır)
        peerConnection.onicecandidateerror = (e) => console.error('[ICE XƏTA]', e.errorText, e.url);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                signalingRef.child('peers').child(currentUser.uid).child('candidates').child('guest').push({
                    candidate: event.candidate.toJSON(),
                    uid: currentUser.uid
                });
            }
        };

        peerConnection.ontrack = event => {
            if (!isHost && mainVideo) {
                if (mainVideo.srcObject !== event.streams[0]) {
                    mainVideo.srcObject = event.streams[0];
                    console.log("🎥 Qonaq stream aldı və srcObject təyin edildi!");
                    mainVideo.autoplay = true;
                    mainVideo.muted = true;
                    mainVideo.playsInline = true;
                    mainVideo.classList.remove('hidden');
                    if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
                    
                    // Safari üçün məcburi yeniləmə
                    mainVideo.load();
                    
                    mainVideo.onloadedmetadata = () => {
                        console.log("✅ Video metadataları oxundu, oynadılır...");
                        const playPromise = mainVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                // Oynatma uğurla başladı.
                            }).catch(error => {
                                if (error.name === 'AbortError') {
                                    console.log("Play əmri pause() tərəfindən dayandırıldı - Bu normaldır, xəta deyil.");
                                } else if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                                    console.error("❌ Safari Autoplay xətası (Toxunuş lazımdır):", error);
                                    showManualPlayButton(mainVideo);
                                }
                            });
                        }
                    };
                }
            }
        };
    };

    // --- HOST: ULDUZ (STAR) TOPOLOGİYASI — hər qonaq üçün ayrıca RTCPeerConnection ---
    // Əgər bu guestUid üçün artıq bağlantı varsa (məs. qonaq yenidən qoşulub),
    // əvvəlcə onu bağlayıb təmiz vəziyyətdən yenisini yaradır.
    function setupPeerConnectionForGuest(guestUid) {
        if (peerConnections[guestUid]) {
            peerConnections[guestUid].close();
        }
        pendingIceCandidatesByGuest[guestUid] = [];
        listeningForCandidatesSet.delete(guestUid);

        const pc = new RTCPeerConnection(configuration);
        peerConnections[guestUid] = pc;

        // Diaqnostik: hansı qonağa aid olduğu bilinsin deyə guestUid loqa əlavə olunur
        pc.onsignalingstatechange = () => console.log(`[${guestUid}] Signaling state dəyişdi:`, pc.signalingState);
        pc.onicecandidateerror = (e) => console.error(`[${guestUid}] [ICE XƏTA]`, e.errorText, e.url);

        pc.onicecandidate = event => {
            if (event.candidate) {
                signalingRef.child('peers').child(guestUid).child('candidates').child('host').push({
                    candidate: event.candidate.toJSON(),
                    uid: currentUser.uid
                });
            }
        };

        // ontrack: DƏYİŞMİR — bu, yalnız QONAQ tərəfdə işləyir, host tərəfdə track almır, sadəcə göndərir.
        pc.ontrack = event => {
            if (!isHost && mainVideo) {
                if (mainVideo.srcObject !== event.streams[0]) {
                    mainVideo.srcObject = event.streams[0];
                }
            }
        };

        return pc;
    }

    // Hazırda aktiv olan stream-i (ekran paylaşımı və ya local fayl) verilən
    // peerConnection-a əlavə edir — yeni qonaq qoşulanda VƏ mövcud qonaqlara
    // yeni stream göndərilərkən (bax: startHostWebRTC) təkrar istifadə olunur.
    function addCurrentStreamToPeerConnection(pc, bitrateOverride) {
        const streamToSend = screenShareStream || localStream;
        if (!streamToSend) return;

        const maxBitrate = bitrateOverride || (screenShareStream ? 3000000 : 10000000); // 3 Mbps ekran paylaşımı / 10 Mbps local fayl
        streamToSend.getTracks().forEach(track => {
            const sender = pc.addTrack(track, streamToSend);
            if (track.kind === 'video') {
                const parameters = sender.getParameters();
                if (!parameters.encodings) parameters.encodings = [{}];
                parameters.encodings[0].maxBitrate = maxBitrate;
                sender.setParameters(parameters).catch(e => console.error("Bitrate xətası:", e));
            }
        });
    }

    // Verilən guestUid-ə offer yaradıb göndərir, sonra onun answer-ini və
    // ICE candidate-lərini dinləməyə başlayır.
    async function sendOfferToGuest(guestUid) {
        const pc = peerConnections[guestUid];
        if (!pc) return;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await signalingRef.child('peers').child(guestUid).child('offer').set({
            type: offer.type,
            sdp: offer.sdp,
            uid: currentUser.uid
        });
        console.log(`📡 [${guestUid}] Offer göndərildi.`);

        listenForAnswerFromGuest(guestUid);
        listenForCandidatesFromGuest(guestUid);
    }

    // Bu guestUid-in answer-ini dinləyir. Renegotiation zamanı (məs. yeni video
    // başladıqda, bax: startHostWebRTC) təkrar çağırıla bilər — ona görə əvvəlcə
    // köhnə dinləyicini söndürür (əvvəlki tək-qonaq axınındakı eyni re-entrancy
    // qorunması, indi hər guestUid üçün ayrıca tətbiq olunur).
    function listenForAnswerFromGuest(guestUid) {
        const answerRef = signalingRef.child('peers').child(guestUid).child('answer');
        answerRef.off('value');
        answerRef.on('value', async snapshot => {
            const data = snapshot.val();
            const pc = peerConnections[guestUid];
            if (!data || !pc || data.uid === currentUser.uid) return;

            if (pc.signalingState !== 'have-local-offer') {
                console.warn(`[${guestUid}] Answer gözlənilmirdi, signalingState:`, pc.signalingState, '- keçilir');
                return;
            }

            answerRef.off('value');

            await pc.setRemoteDescription(new RTCSessionDescription(data));
            console.log(`✅ [${guestUid}] Answer alındı, əlaqə qurulur!`);
            flushPendingIceCandidatesForGuest(guestUid);
        });
    }

    function flushPendingIceCandidatesForGuest(guestUid) {
        const pc = peerConnections[guestUid];
        const queued = pendingIceCandidatesByGuest[guestUid];
        if (!pc || !pc.remoteDescription || !queued || queued.length === 0) return;
        pendingIceCandidatesByGuest[guestUid] = [];
        queued.forEach(candidate => {
            pc.addIceCandidate(candidate).catch(e => console.error(e));
        });
        console.log(`📥 [${guestUid}] Növbədəki ${queued.length} ICE candidate tətbiq edildi`);
    }

    function listenForCandidatesFromGuest(guestUid) {
        if (listeningForCandidatesSet.has(guestUid)) return;
        listeningForCandidatesSet.add(guestUid);

        console.log(`ICE Candidates dinlənilməyə başlandı: [${guestUid}] guest`);
        signalingRef.child('peers').child(guestUid).child('candidates').child('guest').on('child_added', snapshot => {
            const data = snapshot.val();
            const pc = peerConnections[guestUid];
            if (data && pc && data.uid !== currentUser.uid) {
                const candidate = new RTCIceCandidate(data.candidate);
                if (!pc.remoteDescription) {
                    if (!pendingIceCandidatesByGuest[guestUid]) pendingIceCandidatesByGuest[guestUid] = [];
                    pendingIceCandidatesByGuest[guestUid].push(candidate);
                    return;
                }
                pc.addIceCandidate(candidate).catch(e => console.error(e));
                console.log(`[${guestUid}] ICE Candidate əlavə edildi`);
            }
        });
    }

    // --- EKRAN PAYLAŞIMI (Netflix / Disney+ / Prime Video) ---
    // Mövcud setupPeerConnection/signalingRef/TURN konfiqurasiyasını təkrar
    // istifadə edir, sıfırdan yeni WebRTC axını qurulmur. Yalnız host çağıra bilər.
    async function startScreenShare() {
        if (!isHost || screenShareStream) return;

        let stream;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        } catch (err) {
            if (err.name !== 'NotAllowedError') {
                console.error("Ekran paylaşımı xətası:", err);
                showToast("Ekran paylaşımı başladıla bilmədi.");
            }
            return;
        }

        screenShareStream = stream;

        try {
            await signalingRef.remove(); // köhnə offer/answer/candidate məlumatlarını təmizləyir (bütün qonaqlar)
            // Mövcud startHostWebRTC-i təkrar istifadə edir (offer yaratma/göndərmə,
            // answer dinləmə, listenForCandidatesFromGuest) — yalnız stream və bitrate fərqlidir.
            await window.startHostWebRTC(3000000); // 3 Mbps
        } catch (err) {
            // Bu addım uğursuz olarsa screenShareStream sıfırlanmasa, funksiyanın
            // başındakı `if (screenShareStream) return;` keçidi SƏBƏBSİZ olaraq
            // bütün gələcək cəhdləri əbədilik bloklayardı.
            console.error("Ekran paylaşımı WebRTC quraşdırılması uğursuz oldu:", err);
            showToast("Ekran paylaşımı başladıla bilmədi.");
            stream.getTracks().forEach(track => track.stop());
            screenShareStream = null;
            return;
        }

        await videoActiveRef.set(true);

        // Host özü də canlı paylaşımın önizləməsini görür (mövcud srcObject mexanizmi).
        mainVideo.srcObject = stream;
        mainVideo.muted = true;
        mainVideo.autoplay = true;
        mainVideo.playsInline = true;
        mainVideo.classList.remove('hidden');
        if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
        const playPromise = mainVideo.play();
        if (playPromise !== undefined) playPromise.catch(() => {});

        // Brauzerin öz "Stop sharing" bar-ı ilə dayandırma da eyni UI keçidini tetikləsin.
        stream.getVideoTracks()[0].onended = () => stopScreenShare();

        refreshVideoActionButtons();
    }

    async function stopScreenShare() {
        if (!screenShareStream) return;

        screenShareStream.getTracks().forEach(track => {
            track.stop();
            Object.values(peerConnections).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track === track);
                if (sender) pc.removeTrack(sender);
            });
        });
        screenShareStream = null;

        mainVideo.srcObject = null;
        mainVideo.classList.add('hidden');
        if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');

        await videoActiveRef.set(false);
        await signalingRef.remove();

        if (appliedPlatform) renderPlatformPlaceholderContent(appliedPlatform);
        refreshVideoActionButtons();
    }

    // --- DƏQİQ AXIN: HOST ---
    // Mövcud (yeni başlayan) stream-i (localStream və ya screenShareStream, bax:
    // addCurrentStreamToPeerConnection) BÜTÜN qoşulu qonaqlara əlavə edir və hər
    // biri üçün renegotiation (yeni offer/answer mübadiləsi) işə salır. Ekran
    // paylaşımı başlatma və local video yükləmə eyni funksiyanı çağırır — YENİ
    // qoşulan qonaqlar isə viewersRef 'child_added' axınında (bax yuxarı)
    // avtomatik olaraq bu andakı stream-i alır.
    window.startHostWebRTC = async (bitrateOverride) => {
        if (!isHost) return;

        const guestUids = Object.keys(peerConnections);
        for (const guestUid of guestUids) {
            addCurrentStreamToPeerConnection(peerConnections[guestUid], bitrateOverride);
            await sendOfferToGuest(guestUid);
        }
        console.log(`📡 Host ${guestUids.length} qonağa Offer göndərdi.`);
    };

    // --- DƏQİQ AXIN: GUEST ---
    const listenForOffer = () => {
        signalingRef.child('peers').child(currentUser.uid).child('offer').on('value', async snapshot => {
            const data = snapshot.val();
            if (data) {
                console.log("📥 Qonaq Offer aldı, Answer yaradır...");
                if (!peerConnection) setupPeerConnection();
                if (peerConnection.signalingState === "stable") {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                    flushPendingIceCandidates();
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    await signalingRef.child('peers').child(currentUser.uid).child('answer').set({
                        sdp: answer.sdp,
                        type: answer.type,
                        uid: currentUser.uid
                    });
                    console.log("📤 Qonaq Answer göndərdi.");

                    // Yalnız setRemote bitdikdən və Answer yaradıldıqdan sonra Guest candidates-i oxuyur
                    listenForCandidates();
                }
            }
        });
    };

    // --- DƏQİQ AXIN C: NAMİZƏDLƏR ---
    // remoteDescription hələ təyin olunmamış olarsa (setRemoteDescription hələ
    // bitməyib), addIceCandidate çağırışı "remote description was null" xətası
    // verə bilər — belə hallarda candidate-i növbəyə yığırıq, remoteDescription
    // təyin olunan kimi (flushPendingIceCandidates ilə) tətbiq edilir.
    const flushPendingIceCandidates = () => {
        if (!peerConnection || !peerConnection.remoteDescription || pendingIceCandidates.length === 0) return;
        const queued = pendingIceCandidates;
        pendingIceCandidates = [];
        queued.forEach(candidate => {
            peerConnection.addIceCandidate(candidate).catch(e => console.error(e));
        });
        console.log(`📥 Növbədəki ${queued.length} ICE candidate tətbiq edildi`);
    };

    // GUEST: host-dan gələn ICE candidate-ləri dinləyir. HOST tərəfin
    // ekvivalenti üçün bax: listenForCandidatesFromGuest (hər qonaq üçün ayrıca).
    let listeningForCandidates = false;
    const listenForCandidates = () => {
        if (listeningForCandidates) return;
        listeningForCandidates = true;

        console.log("ICE Candidates dinlənilməyə başlandı: host");

        signalingRef.child('peers').child(currentUser.uid).child('candidates').child('host').on('child_added', snapshot => {
            const data = snapshot.val();
            if (data && data.uid !== currentUser.uid && peerConnection) {
                const candidate = new RTCIceCandidate(data.candidate);
                if (!peerConnection.remoteDescription) {
                    pendingIceCandidates.push(candidate);
                    return;
                }
                peerConnection.addIceCandidate(candidate).catch(e => console.error(e));
                console.log("ICE Candidate əlavə edildi");
            }
        });
    };

    // Videonu Bağla Düyməsi (Yalnız Host)
    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', async () => {
            if (!isHost) return;

            // Netflix/Disney+/Prime ekran paylaşımı aktivdirsə, "Videonu Bağla"
            // düyməsi (bu zaman "Paylaşımı Dayandır" kimi göstərilir) paylaşımı dayandırır.
            if (screenShareStream) {
                await stopScreenShare();
                return;
            }

            // YouTube videosu aktivdirsə, onu Firebase-dən silirik — youtubeId
            // dinləyicisi (Section 6) bunu həm bizdə, həm bütün qonaqlarda
            // player-i məhv edib bağlayacaq (appliedPlatform-a deyil,
            // youtubeVideoActive-ə etibar edirik ki, host local videoya
            // keçdikdən sonra köhnə "youtube" platform dəyəri səhvən bu
            // budağı işə salmasın).
            if (youtubeVideoActive) {
                await database.ref(`rooms/${currentRoomId}/youtubeId`).remove();
                await database.ref(`rooms/${currentRoomId}/youtubeState`).remove();
                return;
            }

            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                    Object.values(peerConnections).forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track === track);
                        if (sender) pc.removeTrack(sender);
                    });
                });
                localStream = null;
            }
            
            mainVideo.src = '';
            mainVideo.srcObject = null;
            mainVideo.classList.add('hidden');
            if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
            closeVideoBtn.classList.add('hidden');

            await videoActiveRef.set(false);
            await signalingRef.remove();
        });
    }

    // Guest üçün videoActive-i dinləmək
    videoActiveRef.on('value', snapshot => {
        const isActive = snapshot.val();
        if (!isHost && isActive === false) {
            mainVideo.srcObject = null;
            mainVideo.classList.add('hidden');
            if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
        }
    });

    // Fayl Seçildikdə (Local Playback və Yayımın Başlaması - Yalnız Host)
    if (localVideoUpload && mainVideo) {
        localVideoUpload.addEventListener('change', async (e) => {
            if (!isHost) return;

            const file = e.target.files[0];
            if (!file) return;

            // TODO: Gələcəkdə premium funksiya üçün limitin qaldırılması.
            if (file.size > 500 * 1024 * 1024) {
                showToast("Faylın həcmi 500MB-dan böyük ola bilməz!");
                e.target.value = '';
                return;
            }

            console.log("📁 Fayl seçildi, video yüklənir...");

            const objectURL = URL.createObjectURL(file);
            mainVideo.src = objectURL;
            mainVideo.classList.remove('hidden');
            if (videoPlaceholder) {
                videoPlaceholder.classList.add('hidden');
                videoPlaceholder.style.display = 'none'; // localVideoBtn click handler-inin təyin etdiyi inline "flex" stilini məcburi üstələ
            }
            if (closeVideoBtn) closeVideoBtn.classList.remove('hidden');

            await videoActiveRef.set(true);
            
            // Dərhal yükləməyə məcbur et
            mainVideo.load();

            mainVideo.onloadeddata = async () => {
                console.log("⏳ Video kadrları oxundu, axın (stream) məcbur edilir...");
                try {
                    mainVideo.loop = true; // Stream ölümünün qarşısını al
                    window.isWebRTCSetupPhase = true; // Sinxronizasiyanı müvəqqəti dayandır
                    
                    // Brauzeri "oyatmaq" üçün videonu anlıq səssiz başlat
                    mainVideo.muted = true; 
                    await mainVideo.play(); 

                    // Stream-i dərhal yaxala
                    const stream = mainVideo.captureStream ? mainVideo.captureStream() : (mainVideo.webkitCaptureStream ? mainVideo.webkitCaptureStream() : (mainVideo.mozCaptureStream ? mainVideo.mozCaptureStream() : null));

                    if (!stream || stream.getTracks().length === 0) throw new Error("Stream boşdur və ya yaradıla bilmədi.");
                    console.log("✅ Video Stream uğurla yaradıldı!", stream.getTracks());
                    localStream = stream;

                    // Offer yarat və Firebase-ə göndər
                    await signalingRef.remove();
                    startHostWebRTC();

                    // Stream yaxalandıqdan və siqnal getdikdən sonra videonu dərhal dayandır (Qonaqla eyni vaxtda başlamaq üçün)
                    mainVideo.pause(); 
                    mainVideo.currentTime = 0; // Başa qaytar
                    
                    window.isWebRTCSetupPhase = false; // Sinxronizasiyanı bərpa et
                } catch (error) {
                    console.error("❌ Stream yaxalama xətası:", error);
                    alert("Videonun axına çevrilməsi uğursuz oldu. Fərqli format yoxlayın.");
                    if (closeVideoBtn) closeVideoBtn.click(); // Uğursuz olduqda təmizlə
                    window.isWebRTCSetupPhase = false;
                } finally {
                    mainVideo.onloadeddata = null; // Yalnız ilk dəfə
                }
            };

            // Format dəstəklənmirsə (məs. HEVC/H.265 kodlu .mp4, korlanmış fayl və s.)
            // brauzer 'loadeddata'-nı HEÇ VAXT atmır — bu handler olmadan istifadəçi
            // heç bir geri bildirim almadan sonsuz "heç nə baş vermir" vəziyyətində qalırdı.
            mainVideo.onerror = () => {
                console.error("❌ Video yüklənə bilmədi:", mainVideo.error);
                showToast("Bu video formatı dəstəklənmir. Zəhmət olmasa .mp4 və ya .webm formatını sınayın.");
                mainVideo.onloadeddata = null;
                mainVideo.onerror = null;
                localVideoUpload.value = ''; // eyni və ya başqa faylı yenidən seçmək mümkün olsun
                if (closeVideoBtn) closeVideoBtn.click(); // UI-ı təmiz vəziyyətə qaytarır
            };
        });
    }

    // --- 4.5. PLATFORMA GÖRÜNÜŞÜNÜN RENDER EDİLMƏSİ ---
    // Əvvəllər bu, .room-platform-btn elementlərinə click() simulyasiyası ilə
    // işə düşürdü (seçim indi ayrı select-platform.html səhifəsindədir).
    // İndi birbaşa Firebase-dəki creator.platform dəyərindən idarə olunur.
    const logos = {
        'netflix': 'Netflix.png',
        'disney': 'DisneyPlus.png',
        'prime': 'PrimeVideo.svg.webp'
    };

    // Sidebar-dakı "hazırkı platforma" nişanı üçün ayrıca xəritə — logos-a
    // 'youtube' əlavə etsək renderPlatformView onu (səhvən) statik loqo kimi
    // göstərərdi, YouTube pleyerini yaratmaq əvəzinə.
    const platformBadgeIcons = { netflix: 'Netflix.png', disney: 'DisneyPlus.png', prime: 'PrimeVideo.svg.webp', youtube: 'YouTubeLogo1.png' };
    const platformBadgeNames = { netflix: 'Netflix', disney: 'Disney+', prime: 'Prime Video', youtube: 'YouTube' };

    function updateActivePlatformBadge(platform) {
        const icon = document.getElementById('activePlatformIcon');
        const fallback = document.getElementById('activePlatformIconFallback');
        const nameEl = document.getElementById('activePlatformName');
        const iconSrc = platformBadgeIcons[platform];
        if (iconSrc && icon) {
            icon.src = iconSrc;
            icon.classList.remove('hidden');
            if (fallback) fallback.classList.add('hidden');
        }
        if (nameEl && platformBadgeNames[platform]) nameEl.textContent = platformBadgeNames[platform];
    }

    // Netflix/Disney+/Prime üçün loqo + (host-a) "[Platforma]'ya keç" və
    // "Ekranı Paylaş" düymələrini ehtiva edən placeholder-i qurur.
    const platformGoToLabels = { netflix: "Netflix'ə keç", disney: "Disney+'a keç", prime: "Prime Video'ya keç" };

    function renderPlatformPlaceholderContent(platform) {
        if (!videoPlaceholder || !logos[platform]) return;
        const goToLabel = platformGoToLabels[platform] || `${platformBadgeNames[platform] || platform}'a keç`;

        const hostControlsHTML = isHost ? `
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:20px;">
                <button type="button" id="goToPlatformBtn" class="btn-press rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 sm:text-sm">${goToLabel}</button>
                <button type="button" id="startScreenShareBtn" class="btn-press rounded-lg border border-[#FF014C]/60 bg-[#FF014C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#FF014C]/80 sm:text-sm">Ekranı Paylaş</button>
            </div>` : '';

        videoPlaceholder.innerHTML = `
            <div id="platformLogoWrap" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%;${isHost ? ' cursor:pointer;' : ''}">
                <img src="${logos[platform]}" class="neon-logo">
                ${hostControlsHTML}
            </div>
        `;

        if (!isHost) return;

        const goBtn = document.getElementById('goToPlatformBtn');
        const shareBtn = document.getElementById('startScreenShareBtn');
        const logoWrap = document.getElementById('platformLogoWrap');

        if (goBtn) goBtn.addEventListener('click', (e) => { e.stopPropagation(); handleGoToPlatform(platform); });
        if (shareBtn) shareBtn.addEventListener('click', (e) => { e.stopPropagation(); startScreenShare(); });
        // Loqonun üzərinə klik = "Ekranı Paylaş" düyməsi ilə eyni funksiya.
        if (logoWrap) logoWrap.addEventListener('click', () => startScreenShare());
    }

    function renderPlatformView(platform) {
        // Platforma dəyişəndə aktiv ekran paylaşımı varsa təmiz vəziyyətdən başla.
        if (screenShareStream) stopScreenShare();

        updateActivePlatformBadge(platform);
        if (videoPlaceholder) {
            videoPlaceholder.classList.remove('hidden');
            videoPlaceholder.style.display = 'flex';
        }
        if (mainVideo) mainVideo.classList.add('hidden');

        if (logos[platform]) {
            restoreDefaultChatPanel();
            renderPlatformPlaceholderContent(platform);
        } else if (platform === 'youtube') {
            setYouTubeInlineChat();
            if (window.ytPlayer && typeof window.ytPlayer.destroy === 'function') {
                window.ytPlayer.destroy();
                window.ytPlayer = null;
            }
            videoPlaceholder.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                    <div id="player" style="width: 100%; height: 500px; display: none;"></div>
                </div>
            `;
            // #player indi DOM-dadır — əgər youtubeId dinləyicisi (Section 6) bu render-dən
            // ƏVVƏL işə düşübsə (asinxron Firebase sorğularının sırası qarantiya olunmur,
            // otağa sonradan qoşulan istifadəçidə bu, adi haldır), videoId
            // window.pendingYouTubeVideoId-də "asılı" qalıb, çünki onu geri çağıracaq heç bir
            // click handler yoxdur (platforma seçimi artıq select-platform.html-dədir).
            // Ona görə burada dərhal flush edirik ki, player mütləq yaransın.
            if (window.pendingYouTubeVideoId) {
                const pendingVideoId = window.pendingYouTubeVideoId;
                window.pendingYouTubeVideoId = null;
                initOrLoadYouTubePlayer(pendingVideoId);
            }
            // NOT: burada window.onYouTubeIframeAPIReady()-i erkən çağırmırıq —
            // bu funksiya Section 6-da bundan SONRA təyin edilir (initRoom()-un
            // sinxron gövdəsində platformHint bloku Section 6-dan əvvəl işə düşür),
            // ona görə erkən çağırış həmişə no-op olardı. Real "flush" YouTube-un
            // öz iframe_api skriptinin onYouTubeIframeAPIReady-i çağırması VƏ ya
            // youtubeId Firebase listener-inin pending-queue fallback-i (Section 6,
            // initOrLoadYouTubePlayer) ilə baş verir — #player artıq mövcuddur.
        } else if (platform === 'local') {
            restoreDefaultChatPanel();
            if (isHost) {
                // Otaq "Cihazdan Yüklə" ilə açılırsa, host əl ilə düyməyə basmaq
                // məcburiyyətində qalmasın — mövcud localVideoBtn handler-i (placeholder
                // mesajı + mainVideo gizlətmə + fayl seçici açma) təkrar istifadə olunur.
                if (localVideoBtn) localVideoBtn.click();
            } else if (videoPlaceholder) {
                videoPlaceholder.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                        <svg class="h-16 w-16 text-white mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                        <span class="text-lg font-bold tracking-wider text-white">Host video seçir, gözləyin...</span>
                    </div>
                `;
            }
        }
        refreshVideoActionButtons();
    }

    // Otaq yaradılarkən/select-platform.html-dən yönləndirildikdə URL-ə əlavə
    // olunan ?platform= ipucu ilə ilk görünüşü Firebase cavabını gözləmədən
    // dərhal çək; canlı listener həqiqi dəyərlə üst-üstə düşməyəndə düzəldəcək.
    const platformHint = new URLSearchParams(window.location.search).get('platform');
    if (platformHint && (logos[platformHint] || platformHint === 'youtube')) {
        appliedPlatform = platformHint;
        renderPlatformView(platformHint);
    }

    // --- 5. İkitərəfli Sinxronizasiya (Two-Way Sync) ---
    if (mainVideo) {
        const syncState = (state) => {
            if (!window.isWebRTCSetupPhase) {
                playerStateRef.set({ 
                    state, 
                    time: mainVideo.currentTime, 
                    timestamp: Date.now(),
                    updatedBy: currentUser.uid 
                });
            }
        };

        mainVideo.addEventListener('play', () => syncState('play'));
        mainVideo.addEventListener('pause', () => syncState('pause'));
        mainVideo.addEventListener('seeked', () => syncState('seeked'));

        // Hər iki tərəf oxuyur
        playerStateRef.on('value', snapshot => {
            // Əgər video yüklənməyibsə və ya sıfır vəziyyətindədirsə toxunma
            if (!mainVideo.srcObject && !mainVideo.src) return;
            if (mainVideo.readyState === 0) return;

            const data = snapshot.val();
            if (!data) return;

            // Özümüz göndərdiyimiz update-i ignor edirik (sonsuz döngü olmasın)
            if (data.updatedBy === currentUser.uid) return;

            if (Math.abs(mainVideo.currentTime - data.time) > 1) {
                mainVideo.currentTime = data.time;
            }

            if (data.state === 'play' && mainVideo.paused) {
                const playPromise = mainVideo.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Uğurla oynatıldı
                    }).catch(error => {
                        if (error.name === 'AbortError') {
                            console.log("Sinxronizasiya: Play əmri pause() tərəfindən dayandırıldı.");
                        } else if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                            console.error("❌ Sinxronizasiya: Safari Autoplay xətası (Toxunuş lazımdır):", error);
                            showManualPlayButton(mainVideo);
                        } else {
                            console.error("Sinxronizasiya: Play xətası:", error);
                        }
                    });
                }
            } else if (data.state === 'pause' && !mainVideo.paused) {
                mainVideo.pause();
            }
        });
    }

    // --- 6. YOUTUBE AXTARIŞ VƏ OYNATMA ---
    let ignoreNextYTEvent = false;

    window.onYouTubeIframeAPIReady = function() {
        if (window.pendingYouTubeVideoId) {
            initOrLoadYouTubePlayer(window.pendingYouTubeVideoId);
            window.pendingYouTubeVideoId = null;
        }
    };

    function initOrLoadYouTubePlayer(videoId) {
        // IFrame API skripti hələ yüklənməyibsə, videoId-ni gözləmə siyahısına qoy —
        // ya onYouTubeIframeAPIReady, ya da növbəti Firebase yeniləməsi tətbiq edəcək.
        if (typeof YT === 'undefined' || !YT.Player) {
            window.pendingYouTubeVideoId = videoId;
            return;
        }

        const playerDiv = document.getElementById('player');
        if (!playerDiv) {
            // Platforma hələ "youtube"-a keçirilməyib (#player DOM-da yoxdur) —
            // otağa yeni qoşulan istifadəçidə bu, host-un platformanı və videonu
            // artıq seçdiyi vəziyyətdə baş verə bilər. Platforma düyməsinin click
            // handler-i #player-i yaradandan sonra bunu yenidən çağıracaq.
            window.pendingYouTubeVideoId = videoId;
            return;
        }

        if (mainVideo) mainVideo.classList.add('hidden');
        // Ensure videoPlaceholder is visible because #player is inside it
        if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
        playerDiv.style.display = 'block';

        if (mainVideo && mainVideo.srcObject) {
            mainVideo.srcObject = null;
        }

        if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
            const currentUrl = window.ytPlayer.getVideoUrl();
            if (!currentUrl || !currentUrl.includes(videoId)) {
                window.ytPlayer.loadVideoById(videoId);
                window.ytPlayer.playVideo();
            }
        } else {
            // Player hazır olub real vaxta sinxronlaşana qədər ilkin autoplay
            // hadisələrinin Firebase-ə yazılmasının qarşısını al (bax: onPlayerReady).
            ignoreNextYTEvent = true;

            window.ytPlayer = new YT.Player('player', {
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,
                    'mute': 1,
                    'controls': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'playsinline': 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
    }

    if (currentRoomId) {
        database.ref(`rooms/${currentRoomId}/youtubeId`).on('value', snapshot => {
            const data = snapshot.val();
            youtubeVideoActive = !!(data && data.videoId);

            if (data && data.videoId) {
                initOrLoadYouTubePlayer(data.videoId);
            } else if (window.ytPlayer) {
                // Host "Videonu Bağla"ya basıb youtubeId-ni silib — bütün
                // qonaqlarda (və host özündə) player-i məhv edirik ki, video
                // həqiqətən dayansın, tək DOM-da gizli qalmasın.
                if (typeof window.ytPlayer.destroy === 'function') window.ytPlayer.destroy();
                window.ytPlayer = null;
                const playerDiv = document.getElementById('player');
                if (playerDiv) playerDiv.style.display = 'none';
            }

            refreshVideoActionButtons();
        });

        database.ref(`rooms/${currentRoomId}/youtubeState`).on('value', snapshot => {
            const data = snapshot.val();
            if (!data || !currentUser || data.updatedBy === currentUser.uid) return;
            if (!window.ytPlayer || typeof window.ytPlayer.seekTo !== 'function') return;

            ignoreNextYTEvent = true;

            const currentTime = window.ytPlayer.getCurrentTime() || 0;
            const timeDiff = Math.abs(currentTime - data.time);

            if (timeDiff > 1.5) {
                window.ytPlayer.seekTo(data.time, true);
            }

            if (data.state === 'play') {
                window.ytPlayer.playVideo();
            } else if (data.state === 'pause') {
                window.ytPlayer.pauseVideo();
            }

            setTimeout(() => { ignoreNextYTEvent = false; }, 800);
        });
    }

    // Yeni yaradılan player (adətən otağa qoşulan istifadəçi üçün) autoplay
    // ilə həmişə 0-cı saniyədən başlayır. Real vaxta sinxronlaşmadan bu ilkin
    // hadisələrin Firebase-ə yazılmasının (və beləliklə hamının 0-a düşməsinin)
    // qarşısını almaq üçün ignoreNextYTEvent player yaradılarkən true edilir —
    // burada otaqdakı cari vaxta/state-ə seekTo edilir, YALNIZ bundan sonra
    // normal Play/Pause yazılarına icazə verilir.
    function onPlayerReady() {
        if (!currentRoomId || !window.ytPlayer || !currentUser) {
            ignoreNextYTEvent = false;
            return;
        }
        database.ref(`rooms/${currentRoomId}/youtubeState`).once('value').then(snapshot => {
            const data = snapshot.val();
            if (data && typeof data.time === 'number') {
                // Otaqda artıq gedən video var — real vaxta və state-ə sinxronlaş.
                window.ytPlayer.seekTo(data.time, true);
                if (data.state === 'pause') {
                    window.ytPlayer.pauseVideo();
                } else {
                    window.ytPlayer.playVideo();
                }
                setTimeout(() => { ignoreNextYTEvent = false; }, 800);
            } else {
                // Bu, otaqda seçilən İLK videodur — real başlanğıc nöqtəsi
                // olduğu üçün baza vəziyyətini özümüz yazırıq.
                ignoreNextYTEvent = false;
                database.ref(`rooms/${currentRoomId}/youtubeState`).set({
                    state: 'play',
                    time: window.ytPlayer.getCurrentTime() || 0,
                    updatedBy: currentUser.uid,
                    timestamp: Date.now()
                });
            }
        }).catch(() => { ignoreNextYTEvent = false; });
    }

    function onPlayerStateChange(event) {
        if (ignoreNextYTEvent || !currentUser || !currentRoomId) return;

        const stateMap = {
            1: 'play',
            2: 'pause',
            3: 'seek'
        };

        if (stateMap[event.data]) {
            database.ref(`rooms/${currentRoomId}/youtubeState`).set({
                state: stateMap[event.data] === 'seek' ? 'play' : stateMap[event.data],
                time: window.ytPlayer.getCurrentTime(),
                updatedBy: currentUser.uid,
                timestamp: Date.now()
            });
        }
    }
}

