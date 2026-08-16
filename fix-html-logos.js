const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// 1. Add CSS rules
const styleBlock = `
    <style>
        .sidebar-logo { width: 24px; height: 24px; object-fit: contain; margin-right: 10px; }
        .neon-logo { filter: drop-shadow(0 0 15px currentColor); max-width: 200px; }
    </style>
</head>`;
html = html.replace('</head>', styleBlock);

// 2. Add logos to sidebar buttons
html = html.replace(/<button type="button" class="room-platform-btn ([^"]*)" data-platform="netflix">\s*<span class="text-sm font-semibold text-white">Netflix<\/span>\s*<\/button>/, 
    `<button type="button" class="room-platform-btn $1" data-platform="netflix">
        <img src="NetflixLogo.webp" class="sidebar-logo">
        <span class="text-sm font-semibold text-white">Netflix</span>
    </button>`);

html = html.replace(/<button type="button" class="room-platform-btn ([^"]*)" data-platform="youtube">\s*<span class="text-sm font-semibold text-white">YouTube<\/span>\s*<\/button>/, 
    `<button type="button" class="room-platform-btn $1" data-platform="youtube">
        <img src="YouTubeLogo.webp" class="sidebar-logo">
        <span class="text-sm font-semibold text-white">YouTube</span>
    </button>`);

html = html.replace(/<button type="button" class="room-platform-btn ([^"]*)" data-platform="disney">\s*<span class="text-sm font-semibold text-white">Disney\+<\/span>\s*<\/button>/, 
    `<button type="button" class="room-platform-btn $1" data-platform="disney">
        <img src="DisneyPlusLogo.webp" class="sidebar-logo">
        <span class="text-sm font-semibold text-white">Disney+</span>
    </button>`);

html = html.replace(/<button type="button" class="room-platform-btn ([^"]*)" data-platform="prime">\s*<span class="text-sm font-semibold text-white">Prime Video<\/span>\s*<\/button>/, 
    `<button type="button" class="room-platform-btn $1" data-platform="prime">
        <img src="PrimeVideologo.svg.webp" class="sidebar-logo">
        <span class="text-sm font-semibold text-white">Prime Video</span>
    </button>`);

// 3. Remove my previously added static logos and yt-search-wrapper from video-placeholder
const placeholderRegex = /<div id="video-placeholder"[^>]*>[\s\S]*?<!-- Chat düyməsi -->/;
const cleanPlaceholder = `<div id="video-placeholder" class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black transition-opacity duration-500 rounded-2xl sm:rounded-3xl overflow-y-auto">
                    <!-- Dinamik məzmun buraya yüklənəcək -->
                </div>
            </div>

            <!-- Chat düyməsi -->`;

html = html.replace(placeholderRegex, cleanPlaceholder);

fs.writeFileSync('room.html', html);
console.log("Fixed room.html sidebar logos and cleaned placeholder");
