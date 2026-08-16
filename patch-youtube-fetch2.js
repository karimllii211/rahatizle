const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hookStart = `                        if (e.key === 'Enter') {`;
const hookEnd = `                        }
                    } catch (err) {
                        console.error('YouTube Fetch Xətası:', err);`;

const oldBlock = js.substring(js.indexOf(hookStart), js.indexOf(hookEnd));

const newBlock = `                        if (e.key === 'Enter') {
                            const query = ytSearchInput.value.trim();
                            if (!query) return;
                            
                            console.log("1. YouTube axtarisi basladi. Axtarilan soz:", query);
                            const apiUrl = \`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=\${encodeURIComponent(query)}&key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s\`;
                            console.log("2. API URL formalaşdirildi:", apiUrl);

                            fetch(apiUrl)
                              .then(response => {
                                  console.log("3. API-den xam cavab (response) geldi:", response);
                                  return response.json();
                              })
                              .then(data => {
                                  console.log("4. JSON formatinda data:", data);
                                  if (data.error) {
                                      console.error("YOUTUBE API XETASI:", data.error.message);
                                  }
                                  
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
                                                  ytSearchResults.style.display = 'none';
                                                  ytSearchInput.parentElement.style.display = 'none';
                                                  
                                                  const ytLogo = document.querySelector('#youtube-ui-wrapper .neon-logo');
                                                  if (ytLogo) ytLogo.style.display = 'none';
                                                  
                                                  const wrapper = document.getElementById('youtube-ui-wrapper');
                                                  if(wrapper) wrapper.style.justifyContent = 'flex-start';

                                                  const playerDiv = document.getElementById('player');
                                                  if (playerDiv) playerDiv.style.display = 'block';
                                                  
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
                              })
                              .catch(error => {
                                  console.error("5. KOD XETASI (Fetch qirildi):", error);
                                  if (ytSearchResults) {
                                      ytSearchResults.innerHTML = '<div style="padding: 10px; color: red;">Xəta baş verdi.</div>';
                                      ytSearchResults.style.display = 'block';
                                  }
                              });
`;

js = js.replace(oldBlock, newBlock);
fs.writeFileSync('room.js', js);
console.log("Patched YouTube fetch block");
