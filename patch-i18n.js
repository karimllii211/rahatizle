const fs = require('fs');
let content = fs.readFileSync('i18n.js', 'utf8');

content = content.replace(/"video_screen": "VİDEO EKRANI"/g, '"video_screen": "VİDEO EKRANI",\n        "upload_local": "Cihazdan yüklə"');
content = content.replace(/"video_screen": "VİDEO EKRANI"/g, '"video_screen": "VİDEO EKRANI",\n        "upload_local": "Cihazdan yüklə"');
content = content.replace(/"video_screen": "VIDEO SCREEN"/g, '"video_screen": "VIDEO SCREEN",\n        "upload_local": "Upload from Device"');
content = content.replace(/"video_screen": "ЭКРАН ВИДЕО"/g, '"video_screen": "ЭКРАН ВИДЕО",\n        "upload_local": "Загрузить с устройства"');

// Fix the TR replacement since the first one matched AZ, let's just make it precise.
content = fs.readFileSync('i18n.js', 'utf8');
content = content.replace(/"video_screen": "VİDEO EKRANI"/, '"video_screen": "VİDEO EKRANI",\n        "upload_local": "Cihazdan yüklə"');
content = content.replace(/"video_screen": "VİDEO EKRANI"/, '"video_screen": "VİDEO EKRANI",\n        "upload_local": "Cihazdan yükle"');
content = content.replace(/"video_screen": "VIDEO SCREEN"/, '"video_screen": "VIDEO SCREEN",\n        "upload_local": "Upload from Device"');
content = content.replace(/"video_screen": "ЭКРАН ВИДЕО"/, '"video_screen": "ЭКРАН ВИДЕО",\n        "upload_local": "Загрузить с устройства"');

fs.writeFileSync('i18n.js', content);
