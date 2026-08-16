const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hookStart = `} else if (platform === 'youtube') {`;
const hookEnd = `        // Close left panel on mobile`;

const oldBlock = js.substring(js.indexOf(hookStart), js.indexOf(hookEnd));

const newBlock = `} else if (platform === 'youtube') {
            if (window.ytPlayer && typeof window.ytPlayer.destroy === 'function') {
                window.ytPlayer.destroy();
                window.ytPlayer = null;
            }
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

            // Bind YouTube Search Event DƏRHAL SONRA
            const ytSearchInput = document.getElementById('yt-search-input');
            const ytSearchResults = document.getElementById('yt-search-results');
            
            if (ytSearchInput && ytSearchResults) {
                ytSearchInput.addEventListener('keypress', async (e) => {
                    try {
                        if (e.key === 'Enter') {
                            const query = ytSearchInput.value.trim();
                            if (!query) return;
                            
                            const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=\${encodeURIComponent(query)}&key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s\`);
                            const data = await response.json();
                            
                            ytSearchResults.innerHTML = '';
                            ytSearchResults.style.display = 'block'; // Make sure it's visible!
                            
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
                                        try {
                                            console.log("YouTube kartına klikləndi!");
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
                                            if (typeof database !== 'undefined' && typeof currentRoomId !== 'undefined') {
                                                database.ref(\`rooms/\${currentRoomId}/youtubeId\`).set({
                                                    videoId: videoId,
                                                    timestamp: Date.now()
                                                }).catch(err => console.error("Firebase yazma xətası:", err));
                                            } else {
                                                console.error("Firebase database və ya currentRoomId mövcud deyil!");
                                            }
                                        } catch (err) {
                                            console.error("Card click xətası:", err);
                                        }
                                    });
                                    ytSearchResults.appendChild(card);
                                });
                            } else {
                                ytSearchResults.innerHTML = '<div style="padding: 10px; color: white;">Nəticə tapılmadı.</div>';
                            }
                        }
                    } catch (err) {
                        console.error('YouTube Fetch Xətası:', err);
                        if (ytSearchResults) {
                            ytSearchResults.innerHTML = '<div style="padding: 10px; color: red;">Xəta baş verdi.</div>';
                            ytSearchResults.style.display = 'block';
                        }
                    }
                });
            } else {
                console.error("YouTube DOM elementləri tapılmadı!");
            }
        }
        
`;

js = js.replace(oldBlock, newBlock);
fs.writeFileSync('room.js', js);
console.log("YouTube block fixed completely.");
