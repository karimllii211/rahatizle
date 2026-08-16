const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

// Replace maxResults=8 with maxResults=20
content = content.replace(/maxResults=8/g, 'maxResults=20');

// Replace the card innerHTML generation to include channel name and look better for a list
content = content.replace(
    /card\.innerHTML = \`[\s\S]*?\`;/,
    `card.className = 'cursor-pointer group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-white/10 hover:border-white/10';
     card.innerHTML = \`
        <div class="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-black">
            <img src="\${thumbnail}" alt="Thumbnail" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <svg class="h-8 w-8 text-[#FF014C]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            </div>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
            <h3 class="truncate text-sm font-semibold text-gray-100">\${title}</h3>
            <p class="truncate text-xs text-gray-400 mt-1">\${item.snippet.channelTitle}</p>
        </div>
     \`;`
);

// Add logic to toggle results container visibility
content = content.replace(
    /ytSearchResults\.innerHTML = '';/,
    `ytSearchResults.innerHTML = '';
     document.getElementById('yt-search-results-container').classList.remove('hidden');`
);

content = content.replace(
    /database\.ref\(\`rooms\/\\?\$\{currentRoomId\}\/youtubeId\`\)\.set\(\{[\s\S]*?\}\);/,
    `database.ref(\`rooms/\${currentRoomId}/youtubeId\`).set({
        videoId: videoId,
        timestamp: Date.now()
    });
    document.getElementById('yt-search-results-container').classList.add('hidden');
    ytSearchInput.value = '';`
);

// Replace IFrame API init logic with the exact one requested:
const playerLogicRegex = /\/\/ Global callback for IFrame API[\s\S]*?function onPlayerStateChange\(event\) \{[\s\S]*?\n    \}/m;

const newPlayerLogic = `
    // Global callback for IFrame API
    window.onYouTubeIframeAPIReady = function() {
        console.log("YouTube IFrame API Hazırdır");
    };

    function initOrLoadYouTubePlayer(videoId) {
        const videoPlaceholder = document.getElementById('video-placeholder');
        const mainVideo = document.getElementById('main-video');
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

    // Firebase Listener for youtubeId
    document.addEventListener('DOMContentLoaded', () => {
        // Sync Listener for Video ID
        setTimeout(() => {
            if (currentRoomId) {
                database.ref(\`rooms/\${currentRoomId}/youtubeId\`).on('value', snapshot => {
                    const data = snapshot.val();
                    if (data && data.videoId) {
                        initOrLoadYouTubePlayer(data.videoId);
                    }
                });

                // Sync Listener for Player State
                database.ref(\`rooms/\${currentRoomId}/youtubeState\`).on('value', snapshot => {
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
        }, 1500);
    });

    function onPlayerStateChange(event) {
        if (ignoreNextYTEvent || !currentUser || !currentRoomId) return;

        const stateMap = {
            1: 'play',
            2: 'pause',
            3: 'seek'
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

    // Hide search results when clicking outside
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
`;

content = content.replace(playerLogicRegex, newPlayerLogic);
fs.writeFileSync('room.js', content);
console.log("Patched room.js logic.");
