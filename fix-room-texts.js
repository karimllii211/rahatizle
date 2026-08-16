const fs = require('fs');
let content = fs.readFileSync('room.js', 'utf8');

// Replace string literals with t() calls
content = content.replace(/\`Aktiv İzləyici: \$\{count\}\`/g, '`${t("active_viewers")}: ${count}`');
content = content.replace(/"Videonun axına çevrilməsi uğursuz oldu\. Fərqli format yoxlayın\."/g, 't("alert_video_format")');
content = content.replace(/i18n\.getFileSizeLimit \? i18n\.getFileSizeLimit\(\) \: "Faylın həcmi 500MB-dan böyük ola bilməz!"/g, 't("file_size_limit")');
content = content.replace(/"Faylın həcmi 500MB-dan böyük ola bilməz!"/g, 't("file_size_limit")');
content = content.replace(/"Axtarış zamanı xəta baş verdi\."/g, 't("yt_search_error")');
content = content.replace(/"Bu otağı birdəfəlik silmək istədiyinizə əminsiniz\?"/g, 't("confirm_delete")');
content = content.replace(/"Otaq sahibi yayımı dayandırdı və ya çıxdı\."/g, 't("host_left")');
content = content.replace(/"Otaq sahibi tərəfindən silindi\."/g, 't("room_deleted")');
content = content.replace(/"Xəta baş verdi\."/g, 't("error_occurred")');

// Add a listener to re-render dynamic strings on lang change
const reRenderLogic = `
window.addEventListener('langChanged', () => {
    // Re-render active viewer count if possible
    if (typeof viewersRef !== 'undefined' && viewersRef) {
        viewersRef.once('value').then(snapshot => {
            const data = snapshot.val();
            const count = data ? Object.keys(data).length : 0;
            const activeViewerCount = document.getElementById('activeViewerCount');
            if (activeViewerCount) {
                activeViewerCount.textContent = \`\${t("active_viewers")}: \${count}\`;
            }
        });
    }
});
`;

if (!content.includes('langChanged')) {
    content += '\n' + reRenderLogic;
}

fs.writeFileSync('room.js', content);
