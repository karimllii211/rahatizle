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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;

// --- TOAST ---
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

// Auth Guard
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.replace('index.html');
    } else {
        currentUser = user;
        initYouTubeSearch();
    }
});

let ytSearchDebounceTimer = null;
let ytSuggestDebounceTimer = null;

function initYouTubeSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!roomId) {
        window.location.replace('index.html');
        return;
    }

    const backLink = document.getElementById('backToPlatformLink');
    if (backLink) backLink.href = 'select-platform.html?id=' + encodeURIComponent(roomId);

    const roomRef = database.ref(`rooms/${roomId}`);

    // Otaq silinibsə ana səhifəyə qaytar
    roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            window.location.replace('index.html');
        }
    });

    const input = document.getElementById('yt-search-input');
    const resultsEl = document.getElementById('yt-search-results');
    const statusEl = document.getElementById('yt-search-status');
    const suggestEl = document.getElementById('yt-suggest-list');
    const loadMoreWrap = document.getElementById('yt-loadmore-wrap');
    const loadMoreBtn = document.getElementById('yt-loadmore-btn');
    if (!input || !resultsEl || !statusEl || !suggestEl || !loadMoreWrap || !loadMoreBtn) return;

    let nextPageToken = null;
    let currentQuery = '';
    let seenVideoIds = new Set();

    const hideSuggestions = () => {
        suggestEl.style.display = 'none';
        suggestEl.innerHTML = '';
    };

    const selectVideo = (videoId) => {
        // Qeyd: Firebase-in update()/set() promise-i uğurlu olduqda da `undefined`
        // ilə rezolv olunur — ona görə "yazıldımı" sualını `undefined`-ə görə
        // yoxlamaq mümkün deyil (icazə rədd ediləndə edilən boş `return` də eyni
        // şəkildə `undefined` verir). Bunun əvəzinə açıq bir sentinel istifadə edirik.
        roomRef.child('creator').once('value').then(snapshot => {
            const creatorData = snapshot.val();
            if (!creatorData || creatorData.uid !== currentUser.uid) {
                showToast('Yalnız otaq yaradanı video seçə bilər.');
                return 'denied';
            }
            return roomRef.update({
                'creator/platform': 'youtube',
                'youtubeId': { videoId: videoId }
            }).then(() => 'written');
        }).then((result) => {
            if (result !== 'written') return;
            window.location.href = 'room.html?id=' + encodeURIComponent(roomId) + '&platform=youtube';
        }).catch(() => {
            showToast('Video seçilə bilmədi. Yenidən cəhd edin.');
        });
    };

    const appendResults = (items) => {
        items.forEach(item => {
            if (seenVideoIds.has(item.videoId)) return;
            seenVideoIds.add(item.videoId);

            const card = document.createElement('div');
            card.style.cssText = 'width:160px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;cursor:pointer;text-align:left;';

            const img = document.createElement('img');
            img.src = item.thumbnail || '';
            img.style.cssText = 'width:100%;height:90px;object-fit:cover;display:block;background:#111;';

            const info = document.createElement('div');
            info.style.cssText = 'padding:8px;';

            const titleEl = document.createElement('div');
            titleEl.style.cssText = 'color:#fff;font-size:12px;font-weight:600;line-height:1.3;max-height:2.6em;overflow:hidden;';
            titleEl.textContent = item.title || '';

            const channelEl = document.createElement('div');
            channelEl.style.cssText = 'color:#999;font-size:11px;margin-top:4px;';
            channelEl.textContent = item.channelTitle || '';

            info.appendChild(titleEl);
            info.appendChild(channelEl);
            card.appendChild(img);
            card.appendChild(info);

            card.addEventListener('click', () => selectVideo(item.videoId));

            resultsEl.appendChild(card);
        });
    };

    const performSearch = (query, pageToken) => {
        const isLoadMore = !!pageToken;

        if (isLoadMore) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Yüklənir...';
        } else {
            statusEl.textContent = 'Axtarılır...';
            resultsEl.innerHTML = '';
            loadMoreWrap.style.display = 'none';
            seenVideoIds = new Set();
            nextPageToken = null;
            currentQuery = query;
        }

        const url = `/api/youtube-search?q=${encodeURIComponent(query)}` + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');

        fetch(url)
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    statusEl.textContent = data && data.error ? data.error : 'Axtarış zamanı xəta baş verdi.';
                    if (!isLoadMore) resultsEl.innerHTML = '';
                    loadMoreWrap.style.display = 'none';
                    return;
                }

                const items = data.results || [];
                if (!isLoadMore && items.length === 0) {
                    statusEl.textContent = 'Nəticə tapılmadı.';
                    loadMoreWrap.style.display = 'none';
                    return;
                }

                statusEl.textContent = '';
                appendResults(items);

                nextPageToken = data.nextPageToken || null;
                loadMoreWrap.style.display = nextPageToken ? 'block' : 'none';
            })
            .catch((err) => {
                console.error('YouTube axtarış xətası:', err);
                statusEl.textContent = 'İnternet bağlantınızı yoxlayın.';
                if (!isLoadMore) resultsEl.innerHTML = '';
                loadMoreWrap.style.display = 'none';
            })
            .finally(() => {
                if (isLoadMore) {
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.textContent = 'Daha çox göstər';
                }
            });
    };

    loadMoreBtn.addEventListener('click', () => {
        if (!nextPageToken || !currentQuery) return;
        performSearch(currentQuery, nextPageToken);
    });

    const renderSuggestions = (suggestions) => {
        if (!suggestions.length) {
            hideSuggestions();
            return;
        }
        suggestEl.innerHTML = '';
        suggestions.forEach(text => {
            const item = document.createElement('div');
            item.textContent = text;
            item.style.cssText = 'padding:10px 14px;color:#eee;font-size:13px;cursor:pointer;';
            item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.08)'; });
            item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                input.value = text;
                hideSuggestions();
                clearTimeout(ytSearchDebounceTimer);
                performSearch(text);
            });
            suggestEl.appendChild(item);
        });
        suggestEl.style.display = 'block';
    };

    input.addEventListener('input', () => {
        const query = input.value.trim();

        clearTimeout(ytSearchDebounceTimer);
        clearTimeout(ytSuggestDebounceTimer);

        if (!query) {
            resultsEl.innerHTML = '';
            statusEl.textContent = '';
            loadMoreWrap.style.display = 'none';
            hideSuggestions();
            return;
        }

        statusEl.textContent = 'Axtarılır...';
        ytSearchDebounceTimer = setTimeout(() => performSearch(query), 400);

        ytSuggestDebounceTimer = setTimeout(() => {
            fetch(`/api/youtube-suggest?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => renderSuggestions((data && data.suggestions) || []))
                .catch(() => hideSuggestions());
        }, 300);
    });

    input.addEventListener('blur', () => {
        setTimeout(hideSuggestions, 150);
    });

    input.addEventListener('focus', () => {
        if (!input.value.trim()) hideSuggestions();
    });
}
