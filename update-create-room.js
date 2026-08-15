const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// The markup for the center of create-room.html
const createRoomMarkup = `
    <!-- Room Actions Content -->
    <div class="w-full max-w-3xl mx-auto flex flex-col items-center text-center animate-fade-in-up z-10 px-4 mt-12 mb-20">
        
        <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_30px_rgba(255,1,76,0.15)]">
            <svg class="w-10 h-10 text-[#FF014C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>

        <h1 class="font-['Manrope'] font-extrabold text-4xl md:text-6xl tracking-tight text-white mb-6">
            Yeni Otaq Yarat və ya <br><span class="text-[#FF014C]">Qoşul</span>
        </h1>
        
        <p class="text-[#C8C8C8] text-lg max-w-lg mb-12 leading-relaxed font-medium">
            Dostlarınızla birlikdə izləmək üçün dərhal bir otaq yaradın və onlara kodu göndərin. Və ya mövcud koda sahibsinizsə, aşağıdan daxil olun.
        </p>

        <div class="flex flex-col gap-6 w-full max-w-lg">
            <button id="createRoomBtn" class="flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#FF014C] to-[#b30035] shadow-[0_10px_30px_rgba(255,1,76,0.3)] hover:shadow-[0_15px_40px_rgba(255,1,76,0.5)] hover:-translate-y-1 rounded-2xl text-white font-bold transition-all duration-300 group w-full text-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                YENİ OTAQ YARAT
            </button>
            
            <div class="relative flex items-center justify-center py-4">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
                <div class="relative bg-[#030303] px-4 text-sm text-neutral-500 font-bold tracking-widest uppercase">Və Yaxud</div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/5 border border-white/20 rounded-2xl overflow-hidden focus-within:border-white/40 hover:border-white/40 transition-colors duration-300 w-full h-auto">
                <input type="text" id="roomCodeInput" placeholder="OTAQ KODUNU YAZIN" class="w-full h-16 sm:h-auto bg-transparent text-white px-6 focus:outline-none uppercase tracking-widest placeholder-white/30 text-base font-bold text-center sm:text-left border-b sm:border-b-0 border-white/10 sm:flex-1">
                <button id="joinRoomBtn" class="h-16 sm:h-auto px-8 bg-white text-black hover:bg-gray-200 font-bold transition-colors duration-300 uppercase tracking-widest text-base sm:h-full">
                    QOŞUL
                </button>
            </div>
        </div>
    </div>
`;

// Find where Hero Section starts and Platforms Section ends
const heroStart = indexHtml.indexOf('<!-- Hero Section -->');
const footerStart = indexHtml.indexOf('<!-- Footer -->');

const newHtml = indexHtml.substring(0, heroStart) + createRoomMarkup + indexHtml.substring(footerStart);

fs.writeFileSync('create-room.html', newHtml);
