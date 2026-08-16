const fs = require('fs');

let html = fs.readFileSync('room.html', 'utf8');

const ytWrapper = `
                    <!-- YouTube Search UI -->
                    <div id="yt-search-wrapper" class="z-20 hidden w-full max-w-2xl px-4">
                        <div class="flex items-center rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-[#FF014C] relative">
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

// Find where to inject it: after `<span class="text-xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">500MB LİMİT</span>\n                    </div>`

const hook = `<span class="text-xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">500MB LİMİT</span>\n                    </div>`;

html = html.replace(hook, hook + '\n' + ytWrapper);

fs.writeFileSync('room.html', html);
console.log("Injected yt-search-wrapper");
