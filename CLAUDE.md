# CLAUDE.md

## Cache-busting qaydası (VACİB DAİMİ QAYDA)

VACİB DAİMİ QAYDA: room.js, app.js və ya styles.css faylı hər dəfə redaktə ediləndə, bu, HƏR TAPŞIRIĞIN SON ADDIMI OLARAQ MƏCBURİDİR — dəyişdirilən faylı istifadə edən BÜTÜN HTML fayllarında (room.html, index.html, profile.html, create-room.html, select-platform.html, youtube-search.html və s.) həmin faylın '?v=N' versiya nömrəsini +1 artır. Bu addım unudulsa, istifadəçilərin brauzeri köhnə keşlənmiş versiyanı göstərməyə davam edir və dəyişiklik 'işləmir' kimi görünür, halbuki kod düzgündür. Hər tapşırığı tamamlamazdan əvvəl bunu YOXLA və TƏSDİQLƏ.
