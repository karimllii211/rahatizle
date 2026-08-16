const fs = require('fs');
let html = fs.readFileSync('room.html', 'utf8');

// Replace overflow-hidden with overflow-visible
html = html.replace(/overflow-hidden rounded-2xl border border-white\/10 bg-\[#050505\] shadow-\[0_0_50px_rgba\(0,0,0,0\.5\)\]/, 'overflow-visible rounded-2xl border border-white/10 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.5)]');

fs.writeFileSync('room.html', html);
console.log("Fixed overflow.");
