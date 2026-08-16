const fs = require('fs');
let content = fs.readFileSync('room.html', 'utf8');

// Replace old youtube-player div
content = content.replace(
  /<div id="youtube-player" class="absolute inset-0 z-20 hidden h-full w-full"><\/div>/,
  `<div id="youtube-player-container" class="absolute inset-0 z-20 hidden h-full w-full bg-black"><div id="player" class="h-full w-full"></div></div>`
);

// Replace YouTube Search UI
const oldSearchUI = /<!-- YouTube Search UI -->[\s\S]*?<!-- Chat düyməsi -->/;
const newSearchUI = `<!-- YouTube Search UI -->
            <div class="w-full max-w-5xl mt-6 shrink-0 relative z-40">
                <div class="flex items-center rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-[#FF014C] relative">
                    <div class="pl-4 pr-2">
                        <svg class="h-6 w-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path>
                        </svg>
                    </div>
                    <input type="text" id="yt-search-input" placeholder="YouTube-da video və ya mahnı axtarın..." class="flex-1 bg-transparent px-2 py-4 text-sm text-white placeholder-gray-500 focus:outline-none">
                    <button type="button" id="yt-search-btn" class="btn-press shrink-0 rounded-r-xl bg-[#FF014C] px-6 py-4 font-bold text-white hover:bg-[#FF014C]/80 h-full">Axtar</button>
                    
                    <!-- Search Results Dropdown -->
                    <div id="yt-search-results-container" class="absolute top-full left-0 right-0 mt-2 hidden rounded-xl border border-white/10 bg-[#0f0f0f] shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div id="yt-search-results" class="flex flex-col p-2">
                            <!-- Results will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat düyməsi -->`;

content = content.replace(oldSearchUI, newSearchUI);

fs.writeFileSync('room.html', content);
console.log("Patched room.html layout.");
