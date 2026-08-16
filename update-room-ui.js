const fs = require('fs');

let html = fs.readFileSync('room.html', 'utf8');

// The new placeholder HTML
const newPlaceholder = `
                <div id="video-placeholder" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
                    
                    <!-- Default Screen -->
                    <div id="default-screen" class="flex flex-col items-center">
                        <svg class="z-10 mb-4 h-12 w-12 text-gray-500 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="z-10 text-center font-display text-base font-extrabold tracking-widest text-gray-500 sm:text-xl">VİDEO EKRANI</span>
                    </div>

                    <!-- Platform Logo -->
                    <img id="platform-logo" src="" class="z-10 hidden max-h-24 max-w-[80%] object-contain mb-8 transition-all duration-300" alt="Platform Logo">

                    <!-- Local Upload Status -->
                    <div id="local-upload-status" class="z-10 hidden flex-col items-center">
                        <svg class="h-20 w-20 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                        <span class="text-xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">500MB LİMİT</span>
                    </div>

                    <!-- YouTube Search UI -->
                    <div id="yt-search-wrapper" class="z-20 hidden w-full max-w-2xl px-4">
                        <div class="flex items-center rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-[#FF014C] relative">
                            <!-- Removed YouTube SVG inside search bar -->
                            <input type="text" id="yt-search-input" placeholder="YouTube-da video və ya mahnı axtarın..." class="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none">
                            <button type="button" id="yt-search-btn" class="btn-press shrink-0 rounded-r-xl bg-[#FF014C] px-6 py-4 font-bold text-white hover:bg-[#FF014C]/80 h-full">Axtar</button>
                            
                            <!-- Search Results Dropdown -->
                            <div id="yt-search-results-container" class="absolute top-full left-0 right-0 mt-2 hidden rounded-xl border border-white/10 bg-[#0f0f0f] shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <div id="yt-search-results" class="flex flex-col p-2">
                                    <!-- Results will be injected here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

const regex = /<div id="video-placeholder"[\s\S]*?<\/div>\n            <\/div>/;
html = html.replace(regex, newPlaceholder);

// Clean up old yt-search-container if it's still there
html = html.replace(/<!-- YouTube Search UI -->[\s\S]*?<!-- Chat düyməsi -->/, '<!-- Chat düyməsi -->');

fs.writeFileSync('room.html', html);
