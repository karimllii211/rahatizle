const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const startIndex = content.indexOf("const setNewPasswordBtn = document.getElementById('setNewPasswordBtn');");
const endIndex = content.indexOf("    window.deleteRoom = async (roomId) => {");

if (startIndex !== -1 && endIndex !== -1) {
    const oldBlock = content.substring(startIndex, endIndex);
    
    const newBlock = `const setNewPasswordBtn = document.getElementById('setNewPasswordBtn');
    if (setNewPasswordBtn) {
        setNewPasswordBtn.addEventListener('click', async () => {
            const newPwd = document.getElementById('newPasswordInput').value.trim();
            if (newPwd.length < 6) return showToast("Şifrə ən azı 6 simvol olmalıdır.");

            const activeUser = auth.currentUser;
            if (!activeUser) {
                return showToast("XƏTA: Sistemə daxil olmadığınız üçün şifrəni yeniləmək mümkün deyil.");
            }

            setNewPasswordBtn.disabled = true;
            activeUser.updatePassword(newPwd).then(() => {
                showToast("Şifrəniz uğurla yeniləndi!");
                closeAllModals();
            }).catch(async err => {
                if (err.code === 'auth/requires-recent-login') {
                    const oldPwdPrompt = prompt("Təhlükəsizlik üçün zəhmət olmasa cari (köhnə) şifrənizi daxil edin:");
                    if (oldPwdPrompt) {
                        try {
                            const credential = firebase.auth.EmailAuthProvider.credential(activeUser.email, oldPwdPrompt);
                            await activeUser.reauthenticateWithCredential(credential);
                            await activeUser.updatePassword(newPwd);
                            showToast("Sessiya yeniləndi və şifrə uğurla dəyişdirildi!");
                            closeAllModals();
                        } catch (reauthErr) {
                            showToast("Köhnə şifrə yanlışdır. Təkrar cəhd edin.");
                        }
                    } else {
                        showToast("Şifrəni yeniləmək üçün sessiya təsdiqlənməlidir.");
                    }
                } else {
                    showToast(getErrorMessage(err.code));
                }
            }).finally(() => {
                setNewPasswordBtn.disabled = false;
            });
        });
    }

`;
    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    fs.writeFileSync('app.js', content);
    console.log("Replaced successfully!");
} else {
    console.log("Indexes not found");
}
