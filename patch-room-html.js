const fs = require('fs');
let content = fs.readFileSync('room.html', 'utf8');

// Add youtube-player div next to main-video
content = content.replace(
  /<video id="main-video"[^>]+><\/video>/,
  `$&
                <div id="youtube-player" class="absolute inset-0 z-20 hidden h-full w-full"></div>`
);

// Add youtube search UI below the main video container
const videoContainerRegex = /<div class="group relative flex aspect-video w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl border border-white\/10 bg-\[#050505\] shadow-\[0_0_50px_rgba\(0,0,0,0\.5\)\] sm:rounded-3xl">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Chat düyməsi -->/m;

if (content.match(videoContainerRegex)) {
  const newContainer = `
        <div class="flex h-full w-full flex-1 flex-col items-center overflow-y-auto p-3 pt-24 pb-20 sm:p-6 sm:pt-28 sm:pb-24">
            <div class="group relative flex aspect-video w-full max-w-5xl shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-3xl">
                <video id="main-video" controls muted autoplay playsinline class="relative z-20 hidden h-full w-full object-contain"></video>
                <div id="youtube-player" class="absolute inset-0 z-20 hidden h-full w-full"></div>
                <div id="video-placeholder" class="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-40 transition-opacity duration-500 group-hover:opacity-100">
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#FF014C]/5 to-transparent"></div>
                    <svg class="z-10 mb-4 h-12 w-12 text-white sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="z-10 px-4 text-center font-display text-base font-extrabold tracking-widest text-white sm:text-xl">VİDEO EKRANI</span>
                </div>
            </div>

            <!-- YouTube Search UI -->
            <div class="w-full max-w-5xl mt-6 shrink-0 flex flex-col gap-4">
                <div class="flex gap-2 w-full">
                    <input type="text" id="yt-search-input" placeholder="YouTube-da video və ya mahnı axtarın..." class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#FF014C] focus:outline-none">
                    <button type="button" id="yt-search-btn" class="btn-press shrink-0 rounded-xl bg-[#FF014C] px-6 py-3 font-bold text-white hover:bg-[#FF014C]/80">Axtar</button>
                </div>
                <div id="yt-search-results" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 w-full">
                    <!-- Results will be injected here -->
                </div>
            </div>
        </div>

        <!-- Chat düyməsi -->`;
        
    content = content.replace(/<div class="flex h-full w-full flex-1 items-center justify-center p-3 pt-24 sm:p-6 sm:pt-28">[\s\S]*?<!-- Chat düyməsi -->/m, newContainer);
}

// Add YouTube iframe API script to head
if (!content.includes('youtube.com/iframe_api')) {
  content = content.replace('</head>', '    <script src="https://www.youtube.com/iframe_api"></script>\n</head>');
}

fs.writeFileSync('room.html', content);
console.log("Patched room.html with YouTube UI and API script.");
