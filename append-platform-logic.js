const fs = require('fs');
let js = fs.readFileSync('room.js', 'utf8');

const logic = `
// --- PLATFORM MENU LOGIC ---
const platformBtns = document.querySelectorAll('.room-platform-btn');
const defaultScreen = document.getElementById('default-screen');
const platformLogo = document.getElementById('platform-logo');
const localStatus = document.getElementById('local-upload-status');
const ytSearchWrapper = document.getElementById('yt-search-wrapper');
const videoPlaceholder = document.getElementById('video-placeholder');
const mainVideoEl = document.getElementById('main-video');

const logos = {
    'netflix': { src: 'NetflixLogo.webp', shadow: 'drop-shadow(0 0 10px rgba(229, 9, 20, 0.8))' },
    'youtube': { src: 'YouTubeLogo.webp', shadow: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))' },
    'disney': { src: 'DisneyPlusLogo.webp', shadow: 'drop-shadow(0 0 10px rgba(0, 99, 229, 0.8))' },
    'prime': { src: 'PrimeVideologo.svg.webp', shadow: 'drop-shadow(0 0 10px rgba(0, 168, 225, 0.8))' }
};

platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-platform');
        
        // Show placeholder (hide video)
        if (videoPlaceholder) videoPlaceholder.classList.remove('hidden');
        if (mainVideoEl) mainVideoEl.classList.add('hidden');
        if (window.ytPlayerContainer) window.ytPlayerContainer.classList.add('hidden');
        
        // Hide all sub-elements
        if (defaultScreen) defaultScreen.classList.add('hidden');
        if (platformLogo) platformLogo.classList.add('hidden');
        if (localStatus) localStatus.classList.add('hidden');
        if (ytSearchWrapper) ytSearchWrapper.classList.add('hidden');

        if (platform === 'local') {
            if (localStatus) {
                localStatus.classList.remove('hidden');
                localStatus.classList.add('flex');
            }
            const localInput = document.getElementById('local-video-upload');
            if (localInput) localInput.click();
        } else if (logos[platform]) {
            if (platformLogo) {
                platformLogo.src = logos[platform].src;
                platformLogo.style.filter = logos[platform].shadow;
                platformLogo.classList.remove('hidden');
            }
            
            if (platform === 'youtube' && ytSearchWrapper) {
                ytSearchWrapper.classList.remove('hidden');
            }
        }
        
        // Close left panel on mobile
        const panel = document.getElementById('sidePanel');
        if (panel && window.innerWidth < 768) {
            panel.classList.add('-translate-x-full');
            const panelBackdrop = document.getElementById('panelBackdrop');
            if (panelBackdrop) panelBackdrop.classList.add('hidden');
        }
    });
});
`;

js += '\n' + logic;
fs.writeFileSync('room.js', js);
