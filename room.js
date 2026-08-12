console.log("Otaq məntiqi bura yazılacaq");

document.addEventListener('DOMContentLoaded', () => {
    // URL-dən otaq kodunu (id) oxumaq
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (roomId) {
        console.log("Otaq Kodu:", roomId);
        // Otaq kodunu ekranda göstərmək
        const displayRoomCode = document.getElementById('displayRoomCode');
        if (displayRoomCode) {
            displayRoomCode.textContent = roomId;
        }
    } else {
        console.log("Otaq kodu tapılmadı.");
    }
});
