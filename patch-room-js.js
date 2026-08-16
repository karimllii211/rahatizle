const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

// The logic we want to append
const ytLogic = `
    // --- YOUTUBE API İNTEQRASİYASI ---
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
                const API_KEY = 'AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s';
                const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&type=video&q=\${encodeURIComponent(query)}&key=\${API_KEY}\`);
                const data = await response.json();

                if (data.items) {
                    ytSearchResults.innerHTML = '';
                    data.items.forEach(item => {
                        const videoId = item.id.videoId;
                        const title = item.snippet.title;
                        const thumbnail = item.snippet.thumbnails.medium.url;

                        const card = document.createElement('div');
                        card.className = 'cursor-pointer group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-2 transition-colors hover:bg-white/10';
                        card.innerHTML = \`
                            <div class="relative aspect-video w-full overflow-hidden rounded-lg">
                                <img src="\${thumbnail}" alt="Thumbnail" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105">
                                <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                    <svg class="h-10 w-10 text-[#FF014C]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                </div>
                            </div>
                            <h3 class="line-clamp-2 text-xs font-medium text-gray-200">\${title}</h3>
                        \`;
                        
                        card.addEventListener('click', () => {
                            database.ref(\`rooms/\${currentRoomId}/youtubeId\`).set({
                                videoId: videoId,
                                timestamp: Date.now()
                            });
                        });
                        ytSearchResults.appendChild(card);
                    });
                }
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

    // Global callback for IFrame API
    window.onYouTubeIframeAPIReady = function() {
        window.ytPlayer = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            playerVars: {
                'autoplay': 1,
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
    };

    function onPlayerReady(event) {
        const videoPlaceholder = document.getElementById('video-placeholder');
        const mainVideo = document.getElementById('main-video');
        const ytPlayerEl = document.getElementById('youtube-player');

        database.ref(\`rooms/\${currentRoomId}/youtubeId\`).on('value', snapshot => {
            const data = snapshot.val();
            if (data && data.videoId) {
                // UI update
                if (mainVideo) mainVideo.classList.add('hidden');
                if (videoPlaceholder) videoPlaceholder.classList.add('hidden');
                if (ytPlayerEl) ytPlayerEl.classList.remove('hidden');
                
                // Qapanan local stream-i temizle
                if (mainVideo && mainVideo.srcObject) {
                    mainVideo.srcObject = null;
                }

                // Check if already playing the same video
                const currentUrl = window.ytPlayer.getVideoUrl();
                if (!currentUrl || !currentUrl.includes(data.videoId)) {
                    window.ytPlayer.loadVideoById(data.videoId);
                }
            }
        });

        // Sync Listener
        database.ref(\`rooms/\${currentRoomId}/youtubeState\`).on('value', snapshot => {
            const data = snapshot.val();
            if (!data || !currentUser || data.updatedBy === currentUser.uid) return;
            
            // Xüsusi bayrağı aktivləşdiririk ki, sonsuz dövrə yaranmasın (Echo)
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
        if (ignoreNextYTEvent || !currentUser) return;

        // 1: Playing, 2: Paused, 3: Buffering
        const stateMap = {
            1: 'play',
            2: 'pause',
            3: 'seek' // Treat buffering as a potential seek point to sync
        };
        
        if (stateMap[event.data]) {
            database.ref(\`rooms/\${currentRoomId}/youtubeState\`).set({
                state: stateMap[event.data] === 'seek' ? 'play' : stateMap[event.data],
                time: window.ytPlayer.getCurrentTime(),
                updatedBy: currentUser.uid,
                timestamp: Date.now()
            });
        }
    }
`;

if (!content.includes('onYouTubeIframeAPIReady')) {
    // Append to the end of the DOMContentLoaded block or script
    // I will just append it just before the closing brace of DOMContentLoaded, or at the bottom.
    // room.js is wrapped in DOMContentLoaded? 
    // Let's check if it ends with `});`
    
    // Actually, onYouTubeIframeAPIReady needs to be global, so appending to the absolute end is perfect.
    content += '\n' + ytLogic;
    fs.writeFileSync('room.js', content);
    console.log("Appended YouTube logic to room.js.");
} else {
    console.log("YouTube logic already exists.");
}
