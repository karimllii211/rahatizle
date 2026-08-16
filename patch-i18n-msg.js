const fs = require('fs');
let content = fs.readFileSync('i18n.js', 'utf8');

content = content.replace(/"video_screen": "VİDEO EKRANI",/, '"video_screen": "VİDEO EKRANI",\n        "chat_empty": "Otağa qoşuldunuz. Mesaj yaza bilərsiniz...",');
content = content.replace(/"video_screen": "VİDEO EKRANI",/, '"video_screen": "VİDEO EKRANI",\n        "chat_empty": "Odaya katıldınız. Mesaj yazabilirsiniz...",');
content = content.replace(/"video_screen": "VIDEO SCREEN",/, '"video_screen": "VIDEO SCREEN",\n        "chat_empty": "Joined room. You can send messages...",');
content = content.replace(/"video_screen": "ЭКРАН ВИДЕО",/, '"video_screen": "ЭКРАН ВИДЕО",\n        "chat_empty": "Вы присоединились к комнате. Можете писать...",');

fs.writeFileSync('i18n.js', content);
