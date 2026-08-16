const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hook = `            // Bind YouTube Search Event
            const ytSearchInput = document.getElementById('yt-search-input');
            const ytSearchResults = document.getElementById('yt-search-results');
            
            ytSearchInput.addEventListener('keypress', async (e) => {`;

const insertion = `            // Bind YouTube Search Event
            const ytSearchInput = document.getElementById('yt-search-input');
            const ytSearchResults = document.getElementById('yt-search-results');
            
            if (!ytSearchInput || !ytSearchResults) {
                console.error("YouTube search elements not found in DOM!");
                return;
            }
            
            ytSearchInput.addEventListener('keypress', async (e) => {
                try {`;

js = js.replace(hook, insertion);

const hook2 = `                        } else {
                            ytSearchResults.innerHTML = '<div style="padding: 10px; color: white;">Nəticə tapılmadı.</div>';
                        }
                    } catch (err) {
                        console.error('YouTube Fetch Xətası:', err);
                        ytSearchResults.innerHTML = '<div style="padding: 10px; color: red;">Xəta baş verdi.</div>';
                        ytSearchResults.style.display = 'block';
                    }
                }
            });`;

const insertion2 = `                        } else {
                            ytSearchResults.innerHTML = '<div style="padding: 10px; color: white;">Nəticə tapılmadı.</div>';
                        }
                    } catch (err) {
                        console.error('YouTube Fetch Xətası:', err);
                        if (ytSearchResults) {
                            ytSearchResults.innerHTML = '<div style="padding: 10px; color: red;">Xəta baş verdi.</div>';
                            ytSearchResults.style.display = 'block';
                        }
                    }
                } catch (topLevelErr) {
                    console.error('YouTube Keypress Handler Error:', topLevelErr);
                }
            });`;

js = js.replace(hook2, insertion2);

fs.writeFileSync('room.js', js);
console.log("Safeguarded YouTube logic");
