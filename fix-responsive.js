const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Fix Navbar flex layout for mobile
    // Currently: <nav class="w-full flex items-center justify-between py-6 px-6 md:px-10 border-b ...
    content = content.replace(/<nav class="([^"]*)py-6 px-6 md:px-10([^"]*)"/g, '<nav class="$1py-4 px-4 sm:py-6 sm:px-6 md:px-10 flex-wrap sm:flex-nowrap gap-4$2"');

    // Fix Guest View actions in Navbar
    content = content.replace(/<a href="create-room.html" class="hidden sm:flex[^>]*>/g, 
        '<a href="create-room.html" class="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-gradient-to-r from-[#FF014C] to-[#800020] shadow-[0_0_15px_rgba(255,1,76,0.3)] hover:shadow-[0_0_25px_rgba(255,1,76,0.5)] rounded-xl text-white font-bold transition-all duration-300 text-xs sm:text-base whitespace-nowrap">');
    
    // Decrease Giriş / Qeydiyyat padding on mobile
    content = content.replace(/class="open-login-modal px-5 py-2/g, 'class="open-login-modal px-2 sm:px-5 py-2');
    content = content.replace(/class="open-register-modal px-5 py-2/g, 'class="open-register-modal px-3 sm:px-5 py-2');

    // Fix User View on mobile
    content = content.replace(/id="nav-user-view" class="hidden items-center gap-4"/, 'id="nav-user-view" class="hidden items-center gap-2 sm:gap-4 flex-wrap"');

    // 2. Fix Hero layout on index.html
    if (file === 'index.html' || file === 'create-room-temp.html') {
        // Center text on mobile
        content = content.replace(/<div class="flex flex-col gap-6 z-10 p-6 md:p-10">/, '<div class="flex flex-col gap-6 z-10 p-2 sm:p-6 md:p-10 items-center sm:items-start text-center sm:text-left w-full">');
        
        // Smaller H1 on mobile
        content = content.replace(/font-extrabold text-5xl md:text-6xl lg:text-7xl/g, 'font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl');

        // Center actions on mobile
        content = content.replace(/<div class="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-xl">/, '<div class="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-xl items-center sm:items-start justify-center sm:justify-start">');

        // Fix Posters
        const oldPosters = `                    <!-- Right: Overlapping Posters -->
                    <div class="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center pointer-events-none hidden sm:flex">
                        <!-- Back Poster -->
                        <div class="absolute right-[25%] top-[10%] w-[180px] h-[270px] md:w-[220px] md:h-[330px] rounded-2xl overflow-hidden shadow-2xl opacity-50 transform -rotate-6 scale-90 blur-[1px] hover:blur-none transition-all duration-500">
                            <img src="./poster1.jpg" class="w-full h-full object-cover">
                        </div>
                        <!-- Front Poster -->
                        <div class="absolute right-[10%] top-[20%] w-[200px] h-[300px] md:w-[250px] md:h-[375px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 transform rotate-3 z-10 hover:scale-105 transition-all duration-500">
                            <img src="./poster2.jpg" class="w-full h-full object-cover">
                        </div>
                    </div>`;
        
        const newPosters = `                    <!-- Right: Overlapping Posters -->
                    <div class="relative w-full mt-10 sm:mt-0 h-auto sm:h-[400px] lg:h-[500px] flex flex-col sm:flex-row items-center justify-center pointer-events-none">
                        <!-- Back Poster -->
                        <div class="hidden sm:block absolute right-[25%] top-[10%] w-[180px] h-[270px] md:w-[220px] md:h-[330px] rounded-2xl overflow-hidden shadow-2xl opacity-50 transform -rotate-6 scale-90 blur-[1px] hover:blur-none transition-all duration-500">
                            <img src="./poster1.jpg" class="w-full h-full object-cover">
                        </div>
                        <!-- Front Poster -->
                        <div class="relative sm:absolute right-auto sm:right-[10%] top-auto sm:top-[20%] w-[90%] max-w-[300px] sm:max-w-none sm:w-[250px] aspect-[2/3] sm:h-[375px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 transform sm:rotate-3 z-10 sm:hover:scale-105 transition-all duration-500 mx-auto">
                            <img src="./poster2.jpg" class="w-full h-full object-cover">
                        </div>
                    </div>`;
        
        content = content.replace(oldPosters, newPosters);
    }
    
    fs.writeFileSync(file, content);
});

