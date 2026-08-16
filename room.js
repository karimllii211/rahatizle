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
    
    if (toggleChatBtn && chatPanel) {
        toggleChatBtn.addEventListener('click', () => {
            chatPanel.classList.toggle('translate-x-full');
        });
    }
    if (closeChatBtn && chatPanel) {
        closeChatBtn.addEventListener('click', () => {
            chatPanel.classList.add('translate-x-full');
        });
    }

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

    const roomRef = database.ref(`rooms/${currentRoomId}`);
    const viewersRef = database.ref(`rooms/${currentRoomId}/viewers`);
    const messagesRef = database.ref(`rooms/${currentRoomId}/messages`);

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
                        roomRef.remove();
                    }
                };
            }
        }
        
        // Platformanın dəyişməsini vizual olaraq göstərmək
        const currentPlatform = data.creator ? data.creator.platform : null;
        if (currentPlatform) {
            document.querySelectorAll('.room-platform-btn').forEach(btn => {
                if (btn.getAttribute('data-platform') === currentPlatform) {
                    btn.classList.add('border-white/50', 'bg-white/10');
                } else {
                    btn.classList.remove('border-white/50', 'bg-white/10');
                }
            });
        }
    });

    // 1.5. Otaq Yaradanın Platformanı Dəyişməsi
    document.querySelectorAll('.room-platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            roomRef.child('creator').once('value').then(snapshot => {
                const creatorData = snapshot.val();
                if (creatorData && creatorData.uid === currentUser.uid) {
                    const selectedPlatform = btn.getAttribute('data-platform');
                    roomRef.child('creator/platform').set(selectedPlatform).then(() => {
                        showToast("Platforma dəyişdirildi!");
                    });
                } else {
                    showToast("Yalnız otaq yaradanı platformanı dəyişə bilər.");
                }
            });
        });
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

    // Otaqdakı izləyicilərin sayını ekranda göstərmək
    viewersRef.on('value', snapshot => {
        const data = snapshot.val();
        const count = data ? Object.keys(data).length : 0;
        if (activeViewerCount) {
            activeViewerCount.textContent = `Aktiv İzləyici: ${count}`;
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
    let peerConnection = null;
    let isHost = false;

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
                urls: turn.url || 'turn:141.144.238.167:3478',
                username: turn.username || 'rahatizle',
                credential: turn.credential || 'Video2026!'
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
            
            // Qonaq girən kimi offer-i dinləyir (Dəqiq Axın B)
            listenForOffer();
            
            // Yenilənməni bildir (Guest Refresh Trigger)
            roomRef.child('guestTrigger').set(Date.now());
            signalingRef.child('candidates').remove(); // Köhnə candidate-ləri təmizlə
        }
        
        console.log("👤 Mənim Rolum: ", isHost ? "HOST" : "GUEST");

        if (isHost) {
            roomRef.child('guestTrigger').on('value', async snapshot => {
                if (snapshot.exists() && mainVideo.src) {
                    console.log("🔄 Qonaq yenidən qoşuldu, WebRTC sıfırlanır...");
                    
                    if (peerConnection) {
                        peerConnection.close();
                    }
                    peerConnection = null;
                    
                    setupPeerConnection();
                    
                    const stream = mainVideo.captureStream ? mainVideo.captureStream() : (mainVideo.webkitCaptureStream ? mainVideo.webkitCaptureStream() : (mainVideo.mozCaptureStream ? mainVideo.mozCaptureStream() : null));
                    if (stream) {
                        stream.getTracks().forEach(track => {
                            const sender = peerConnection.addTrack(track, stream);
                            if (track.kind === 'video') {
                                const parameters = sender.getParameters();
                                if (!parameters.encodings) parameters.encodings = [{}];
                                parameters.encodings[0].maxBitrate = 10000000; // 10 Mbps
                                sender.setParameters(parameters).catch(e => console.error("Bitrate xətası:", e));
                            }
                        });
                    }
                    
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    await signalingRef.child('offer').set({
                        type: offer.type,
                        sdp: offer.sdp,
                        uid: currentUser.uid
                    });
                    console.log("📡 Yeni Offer göndərildi!");
                }
            });
        }
    });

    const setupPeerConnection = () => {
        if (peerConnection) return;
        
        peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                const target = isHost ? 'host' : 'guest';
                signalingRef.child('candidates').child(target).push({
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

    // --- DƏQİQ AXIN: HOST ---
    window.startHostWebRTC = async () => {
        if (!isHost) return;
        setupPeerConnection();
        
        if (localStream) {
            localStream.getTracks().forEach(track => {
                const sender = peerConnection.addTrack(track, localStream);
                if (track.kind === 'video') {
                    const parameters = sender.getParameters();
                    if (!parameters.encodings) parameters.encodings = [{}];
                    parameters.encodings[0].maxBitrate = 10000000; // 10 Mbps
                    sender.setParameters(parameters).catch(e => console.error("Bitrate xətası:", e));
                }
            });
        }

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await signalingRef.child('offer').set({
            sdp: offer.sdp,
            type: offer.type,
            uid: currentUser.uid
        });
        console.log("📡 Host Offer yaratdı və Firebase-ə göndərdi.");

        // Host yalnız Answer-i dinləyir (Davamlı)
        signalingRef.child('answer').on('value', async snapshot => {
            const data = snapshot.val();
            if (data && data.uid !== currentUser.uid && peerConnection.signalingState !== "stable") {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                console.log("✅ Host Answer aldı, əlaqə qurulur!");
                // Yalnız setRemote bitdikdən sonra Host candidates-i oxuyur
                listenForCandidates();
            }
        });
    };

    // --- DƏQİQ AXIN: GUEST ---
    const listenForOffer = () => {
        signalingRef.child('offer').on('value', async snapshot => {
            const data = snapshot.val();
            if (data && data.uid !== currentUser.uid) {
                console.log("📥 Qonaq Offer aldı, Answer yaradır...");
                if (!peerConnection) setupPeerConnection();
                if (peerConnection.signalingState === "stable") {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    await signalingRef.child('answer').set({
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
    let listeningForCandidates = false;
    const listenForCandidates = () => {
        if (listeningForCandidates) return;
        listeningForCandidates = true;
        
        const targetToListen = isHost ? 'guest' : 'host';
        console.log("ICE Candidates dinlənilməyə başlandı: " + targetToListen);
        
        signalingRef.child('candidates').child(targetToListen).on('child_added', snapshot => {
            const data = snapshot.val();
            if (data && data.uid !== currentUser.uid && peerConnection) {
                const candidate = new RTCIceCandidate(data.candidate);
                peerConnection.addIceCandidate(candidate).catch(e => console.error(e));
                console.log("ICE Candidate əlavə edildi");
            }
        });
    };

    // Videonu Bağla Düyməsi (Yalnız Host)
    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', async () => {
            if (!isHost) return;
            
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                    if (peerConnection) {
                        const sender = peerConnection.getSenders().find(s => s.track === track);
                        if (sender) peerConnection.removeTrack(sender);
                    }
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

            console.log("📁 Fayl seçildi, video yüklənir...");

            const objectURL = URL.createObjectURL(file);
            mainVideo.src = objectURL;
            mainVideo.classList.remove('hidden');
            if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
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
        });
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
    initYouTubeFeature(mainVideo, videoPlaceholder);
}

function initYouTubeFeature(mainVideo, videoPlaceholder) {
    const ytSearchInput = document.getElementById('yt-search-input');
    const ytSearchBtn = document.getElementById('yt-search-btn');
    const ytSearchResults = document.getElementById('yt-search-results');
    let ignoreNextYTEvent = false;

    if (ytSearchBtn && ytSearchInput && ytSearchResults) {
        ytSearchBtn.addEventListener('click', async () => {
            const query = ytSearchInput.value.trim();
            if (!query) return;

            ytSearchBtn.disabled = true;
            ytSearchBtn.textContent = '...';

            try {
                const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                const container = document.getElementById('yt-search-results-container');

                if (!response.ok || data.error) {
                    showToast(data.error || "Axtarış zamanı xəta baş verdi.");
                    container.classList.add('hidden');
                    return;
                }

                ytSearchResults.innerHTML = '';

                if (!data.items || data.items.length === 0) {
                    showToast("Nəticə tapılmadı.");
                    container.classList.add('hidden');
                    return;
                }

                container.classList.remove('hidden');
                data.items.forEach(item => {
                    const { videoId, title, channelTitle, thumbnail } = item;
                    if (!videoId) return;

                    const card = document.createElement('div');
                    card.className = 'cursor-pointer group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white/10 hover:border-white/10';

                    const thumbWrap = document.createElement('div');
                    thumbWrap.className = 'relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-black';
                    const img = document.createElement('img');
                    img.src = thumbnail;
                    img.alt = 'Thumbnail';
                    img.className = 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105';
                    const overlay = document.createElement('div');
                    overlay.className = 'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100';
                    // Statik SVG, heç bir API məlumatı interpolyasiya olunmur — XSS riski yoxdur.
                    overlay.innerHTML = '<svg class="h-8 w-8 text-[#FF014C]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
                    thumbWrap.append(img, overlay);

                    const textWrap = document.createElement('div');
                    textWrap.className = 'flex flex-col flex-1 min-w-0';
                    const h3 = document.createElement('h3');
                    h3.className = 'truncate text-sm font-semibold text-gray-100';
                    h3.textContent = title;
                    const p = document.createElement('p');
                    p.className = 'truncate text-xs text-gray-400 mt-1';
                    p.textContent = channelTitle;
                    textWrap.append(h3, p);

                    card.append(thumbWrap, textWrap);

                    card.addEventListener('click', () => {
                        database.ref(`rooms/${currentRoomId}/youtubeId`).set({
                            videoId: videoId,
                            timestamp: Date.now()
                        });
                        container.classList.add('hidden');
                        ytSearchInput.value = '';
                    });
                    ytSearchResults.appendChild(card);
                });
            } catch (error) {
                console.error('YouTube Axtarış Xətası:', error);
                showToast("Axtarış zamanı xəta baş verdi.");
            } finally {
                ytSearchBtn.disabled = false;
                ytSearchBtn.textContent = 'Axtar';
            }
        });

        ytSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') ytSearchBtn.click();
        });
    }

    // IFrame API-nin öz qlobal kontraktı: skript yükləndikdə bu funksiyanı çağırır.
    // Qeyd: `<script src="...iframe_api">` səhifənin <head>-ində, bu funksiyanın
    // təyin edildiyi andan (Firebase auth həll olunduqdan sonra) xeyli əvvəl işə
    // düşür — real şəraitdə API adətən bu callback-dən ÖNCƏ artıq hazır olur.
    // Ona görə əsas hazırlıq siqnalı kimi `YT.Player`-in mövcudluğu yoxlanılır;
    // callback yalnız API-nin hələ yüklənməkdə olduğu nadir hal üçün ehtiyat yoludur.
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

        const ytPlayerContainer = document.getElementById('youtube-player-container');

        if (mainVideo) mainVideo.classList.add('hidden');
        if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
        if (ytPlayerContainer) ytPlayerContainer.classList.remove('hidden');

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
            window.ytPlayer = new YT.Player('player', {
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,
                    'controls': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'playsinline': 1
                },
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
        }
    }

    if (currentRoomId) {
        database.ref(`rooms/${currentRoomId}/youtubeId`).on('value', snapshot => {
            const data = snapshot.val();
            if (data && data.videoId) initOrLoadYouTubePlayer(data.videoId);
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

    // Kənara kliklədikdə axtarış nəticələrini bağla
    document.addEventListener('click', (e) => {
        const container = document.getElementById('yt-search-results-container');
        const searchInput = document.getElementById('yt-search-input');
        const searchBtn = document.getElementById('yt-search-btn');
        if (container && !container.classList.contains('hidden')) {
            if (!container.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
                container.classList.add('hidden');
            }
        }
    });
}
