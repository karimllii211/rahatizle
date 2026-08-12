document.addEventListener('DOMContentLoaded', () => {
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let roomCode = '';
            for (let i = 0; i < 6; i++) {
                roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            window.location.href = `room.html?id=${roomCode}`;
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const code = roomCodeInput.value.trim();
            if (!code) {
                alert('Zəhmət olmasa otaq kodunu daxil edin.');
                return;
            }
            window.location.href = `room.html?id=${code}`;
        });
    }
});
