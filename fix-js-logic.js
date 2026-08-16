const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

// Strip old platform logic (line 948 onwards)
js = js.substring(0, js.indexOf('// --- PLATFORM MENU LOGIC ---'));

// Add new logic
const newLogic = `
// --- PLATFORM MENU LOGIC ---
const platformBtns = document.querySelectorAll('.room-platform-btn');
const videoPlaceholder = document.getElementById('video-placeholder');
const mainVideoEl = document.getElementById('main-video');

const logos = {
    'netflix': 'NetflixLogo.webp',
    'disney': 'DisneyPlusLogo.webp',
    'prime': 'PrimeVideologo.svg.webp'
};

platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-platform');
        
        // Show placeholder (hide video)
        if (videoPlaceholder) {
            videoPlaceholder.classList.remove('hidden');
            videoPlaceholder.style.display = 'flex'; // Ensure flex
        }
        if (mainVideoEl) mainVideoEl.classList.add('hidden');
        
        if (platform === 'local') {
            videoPlaceholder.innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <svg class="h-20 w-20 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                    <span class="text-xl font-bold tracking-wider text-white" style="filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));">500MB LİMİT</span>
                </div>
            \`;
            document.getElementById('local-video-upload').click();
        } else if (logos[platform]) {
            videoPlaceholder.innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                    <img src="\${logos[platform]}" class="neon-logo">
                </div>
            \`;
        } else if (platform === 'youtube') {
            videoPlaceholder.innerHTML = \`
                <div id="youtube-ui-wrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: center;">
                    <img src="YouTubeLogo.webp" class="neon-logo" style="margin-bottom: 20px;">
                    <div style="position: relative; width: 80%; max-width: 600px;">
                        <input type="text" id="yt-search-input" placeholder="YouTube-da axtar..." style="width: 100%; padding: 15px; border-radius: 8px; color: black;">
                        <div id="yt-search-results" style="position: absolute; top: 100%; left: 0; right: 0; background: #1a1a1a; max-height: 400px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: none;"></div>
                    </div>
                    <div id="player" style="width: 100%; height: 500px; margin-top: 20px; display: none;"></div>
                </div>
            \`;

            // Bind YouTube Search Event
            const ytSearchInput = document.getElementById('yt-search-input');
            const ytSearchResults = document.getElementById('yt-search-results');
            
            ytSearchInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const query = ytSearchInput.value.trim();
                    if (!query) return;
                    
                    try {
                        const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=\${encodeURIComponent(query)}&key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s\`);
                        const data = await response.json();
                        
                        ytSearchResults.innerHTML = '';
                        ytSearchResults.style.display = 'block';
                        
                        if (data.items && data.items.length > 0) {
                            data.items.forEach(item => {
                                const videoId = item.id ? item.id.videoId : null;
                                const snippet = item.snippet || {};
                                if (!videoId) return;

                                const card = document.createElement('div');
                                card.style.cssText = 'display: flex; gap: 10px; padding: 10px; cursor: pointer; border-bottom: 1px solid #333; align-items: center;';
                                card.innerHTML = \`
                                    <img src="\${snippet.thumbnails?.default?.url}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;">
                                    <div style="color: white; overflow: hidden;">
                                        <div style="font-size: 14px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${snippet.title}</div>
                                        <div style="font-size: 12px; color: #aaa;">\${snippet.channelTitle}</div>
                                    </div>
                                \`;

                                card.addEventListener('click', () => {
                                    // Siyahını gizlət və qutunu gizlət
                                    ytSearchResults.style.display = 'none';
                                    ytSearchInput.parentElement.style.display = 'none';
                                    
                                    // Loqonu gizlət
                                    const ytLogo = document.querySelector('#youtube-ui-wrapper .neon-logo');
                                    if (ytLogo) ytLogo.style.display = 'none';
                                    
                                    // Wrapperi yuxarı çək ki video tam görünsün
                                    const wrapper = document.getElementById('youtube-ui-wrapper');
                                    if(wrapper) wrapper.style.justifyContent = 'flex-start';

                                    const playerDiv = document.getElementById('player');
                                    if (playerDiv) playerDiv.style.display = 'block';
                                    
                                    // Firebase-ə yaz (bu avtomatik initOrLoadYouTubePlayer-i çağıracaq)
                                    if (window.database && window.currentRoomId) {
                                        window.database.ref(\`rooms/\${window.currentRoomId}/youtubeId\`).set({
                                            videoId: videoId,
                                            timestamp: Date.now()
                                        });
                                    }
                                });
                                ytSearchResults.appendChild(card);
                            });
                        } else {
                            ytSearchResults.innerHTML = '<div style="padding: 10px; color: white;">Nəticə tapılmadı.</div>';
                        }
                    } catch (err) {
                        console.error('YouTube Fetch Xətası:', err);
                        ytSearchResults.innerHTML = '<div style="padding: 10px; color: red;">Xəta baş verdi.</div>';
                        ytSearchResults.style.display = 'block';
                    }
                }
            });
        }
        
        // Close left panel on mobile
        const panel = document.getElementById('sidePanel');
        if (panel && window.innerWidth < 768) {
            panel.classList.add('-translate-x-full');
            const panelBackdrop = document.getElementById('panelBackdrop');
            if (panelBackdrop) panelBackdrop.classList.add('hidden');
        }
    });
});
`;

js += newLogic;
fs.writeFileSync('room.js', js);
console.log("Replaced platform logic");
