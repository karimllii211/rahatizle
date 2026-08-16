const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

const oldBtn = /<button type="button" id="localVideoBtn"[\s\S]*?<\/button>/;
const newBtn = `<button type="button" id="localVideoBtn" class="room-platform-btn btn-press flex flex-col w-full items-center justify-center gap-1 rounded-xl border border-white/20 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10" data-platform="local">
                <div class="flex items-center gap-2">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span>Cihazdan yüklə</span>
                </div>
                <span class="text-[10px] font-bold text-red-500 tracking-wider">500MB LİMİT</span>
            </button>`;

html = html.replace(oldBtn, newBtn);
fs.writeFileSync('room.html', html);
console.log("Local btn updated");
