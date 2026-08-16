const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hook = `                                card.addEventListener('click', () => {
                                    // Siyahını gizlət və qutunu gizlət`;

const insertion = `                                card.addEventListener('click', () => {
                                    try {
                                        console.log("Card clicked, setting up player...");
                                        // Siyahını gizlət və qutunu gizlət`;

js = js.replace(hook, insertion);

const hook2 = `                                    if (window.database && window.currentRoomId) {
                                        window.database.ref(\`rooms/\${window.currentRoomId}/youtubeId\`).set({
                                            videoId: videoId,
                                            timestamp: Date.now()
                                        });
                                    }
                                });`;

const insertion2 = `                                    if (database && currentRoomId) {
                                        database.ref(\`rooms/\${currentRoomId}/youtubeId\`).set({
                                            videoId: videoId,
                                            timestamp: Date.now()
                                        }).then(() => console.log("Firebase yazıldı")).catch(e => console.error("Firebase yazma xətası:", e));
                                    } else {
                                        console.error("database və ya currentRoomId tapılmadı!");
                                    }
                                    } catch (err) {
                                        console.error("Card click xətası:", err);
                                    }
                                });`;

js = js.replace(hook2, insertion2);

fs.writeFileSync('room.js', js);
console.log("Safeguarded card click");
