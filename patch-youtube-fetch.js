const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const hook = `                            const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=\${encodeURIComponent(query)}&key=AIzaSyCr51yPNOwDSdNkOdI0Xj1XOw6oS5FPm-s\`);
                            const data = await response.json();
                            
                            ytSearchResults.innerHTML = '';
                            ytSearchResults.style.display = 'block'; // Make sure it's visible!
                            
                            if (data.items && data.items.length > 0) {`;

const newCode = `                            console.log("1. YouTube axtarisi basladi. Axtarilan soz:", query);
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
                                    
                                    if (data.items && data.items.length > 0) {`;

// Wait, since I'm converting async/await to fetch().then().catch(), I need to match the end of the block too!
// It's better to rewrite the whole 'Enter' block.
