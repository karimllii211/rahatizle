const fs = require('fs');
let v = fs.readFileSync('vercel.json', 'utf8');

// We want to replace the CSP string with the properly requested one.
let obj = JSON.parse(v);
let cspHeader = obj.headers[0].headers.find(h => h.key === "Content-Security-Policy");

let newCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.jsdelivr.net https://cdn.tailwindcss.com https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' blob:; connect-src 'self' https://*.vercel.app https://*.firebaseapp.com https://api.emailjs.com https://*.googleapis.com https://www.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com wss://*.firebasedatabase.app https://securetoken.googleapis.com https://identitytoolkit.googleapis.com; frame-src https://rahatizle-yeni.firebaseapp.com https://accounts.google.com https://www.youtube.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests";

cspHeader.value = newCsp;

fs.writeFileSync('vercel.json', JSON.stringify(obj, null, 2));
console.log("Updated vercel.json CSP");
