const fs = require('fs');

let content = fs.readFileSync('i18n.js', 'utf8');

const newKeys = {
    toast_enter_email: { AZ: "E-poçt daxil edin!", TR: "E-posta girin!", EN: "Enter an email!", RU: "Введите email!" },
    toast_email_sending: { AZ: "E-poçt göndərilir, zəhmət olmasa gözləyin...", TR: "E-posta gönderiliyor, lütfen bekleyin...", EN: "Sending email, please wait...", RU: "Отправка email, пожалуйста подождите..." },
    toast_code_sent: { AZ: "6 rəqəmli kod e-poçtunuza göndərildi!", TR: "6 haneli kod e-postanıza gönderildi!", EN: "A 6-digit code was sent to your email!", RU: "6-значный код отправлен на ваш email!" },
    toast_code_failed: { AZ: "Kod göndərilə bilmədi. Zəhmət olmasa yenidən cəhd edin.", TR: "Kod gönderilemedi. Lütfen tekrar deneyin.", EN: "Failed to send code. Please try again.", RU: "Не удалось отправить код. Попробуйте снова." },
    toast_emailjs_error: { AZ: "Xəta: EmailJS yüklənə bilmədi. İnternet bağlantınızı və ya brauzer icazələrini (CSP/AdBlock) yoxlayın.", TR: "Hata: EmailJS yüklenemedi. İnternet bağlantınızı kontrol edin.", EN: "Error: EmailJS could not be loaded. Check your connection.", RU: "Ошибка: EmailJS не загрузился. Проверьте подключение." },
    toast_network_error: { AZ: "Şəbəkə xətası baş verdi.", TR: "Ağ hatası oluştu.", EN: "A network error occurred.", RU: "Произошла сетевая ошибка." },
    toast_google_email_fixed: { AZ: "Google hesablarının e-poçtu dəyişdirilə bilməz.", TR: "Google hesaplarının e-postası değiştirilemez.", EN: "Google account emails cannot be changed.", RU: "Email аккаунтов Google нельзя изменить." },
    toast_enter_password: { AZ: "Şifrəni daxil edin.", TR: "Şifrenizi girin.", EN: "Enter your password.", RU: "Введите пароль." },
    toast_security_passed: { AZ: "Təhlükəsizlik təsdiqləndi. İndi yeni e-poçtu yaza bilərsiniz.", TR: "Güvenlik doğrulandı. Şimdi yeni e-postanızı yazabilirsiniz.", EN: "Security verified. You can now enter a new email.", RU: "Безопасность подтверждена. Введите новый email." },
    toast_wrong_password: { AZ: "Şifrə yanlışdır və ya xəta baş verdi.", TR: "Şifre yanlış veya bir hata oluştu.", EN: "Wrong password or an error occurred.", RU: "Неверный пароль или произошла ошибка." },
    toast_enter_new_email: { AZ: "Yeni e-poçt daxil edin!", TR: "Yeni e-posta girin!", EN: "Enter a new email!", RU: "Введите новый email!" },
    toast_email_updated: { AZ: "E-poçtunuz uğurla yeniləndi!", TR: "E-postanız başarıyla güncellendi!", EN: "Your email was successfully updated!", RU: "Ваш email успешно обновлен!" },
    toast_enter_6_digit: { AZ: "6 rəqəmli kodu daxil edin.", TR: "6 haneli kodu girin.", EN: "Enter the 6-digit code.", RU: "Введите 6-значный код." },
    toast_session_expired: { AZ: "Sessiyanın vaxtı bitib. Yeni kod tələb edin.", TR: "Oturum süresi doldu. Yeni kod isteyin.", EN: "Session expired. Request a new code.", RU: "Срок сессии истек. Запросите новый код." },
    toast_wrong_code: { AZ: "Kod yanlışdır.", TR: "Kod yanlış.", EN: "The code is incorrect.", RU: "Неверный код." },
    toast_set_new_password: { AZ: "Yeni şifrənizi təyin edin.", TR: "Yeni şifrenizi belirleyin.", EN: "Set your new password.", RU: "Установите новый пароль." },
    toast_pwd_length: { AZ: "Şifrə ən azı 8 simvol olmalıdır.", TR: "Şifre en az 8 karakter olmalıdır.", EN: "Password must be at least 8 characters.", RU: "Пароль должен быть не менее 8 символов." },
    toast_pwd_updated: { AZ: "Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz.", TR: "Şifreniz başarıyla güncellendi! Şimdi giriş yapabilirsiniz.", EN: "Password updated successfully! You can now log in.", RU: "Пароль успешно обновлен! Теперь вы можете войти." },
    toast_pwd_update_failed: { AZ: "Şifrə yenilənə bilmədi.", TR: "Şifre güncellenemedi.", EN: "Password could not be updated.", RU: "Не удалось обновить пароль." },
    toast_enter_email_pwd: { AZ: "E-poçt və şifrəni daxil edin.", TR: "E-posta ve şifrenizi girin.", EN: "Enter email and password.", RU: "Введите email и пароль." },
    toast_register_first: { AZ: "Zəhmət olmasa əvvəlcə qeydiyyatdan keçin.", TR: "Lütfen önce kayıt olun.", EN: "Please register first.", RU: "Пожалуйста, сначала зарегистрируйтесь." },
    toast_login_success: { AZ: "Uğurla daxil oldunuz!", TR: "Başarıyla giriş yaptınız!", EN: "Successfully logged in!", RU: "Успешный вход!" },
    toast_register_success: { AZ: "Uğurla qeydiyyatdan keçdiniz!", TR: "Başarıyla kayıt oldunuz!", EN: "Successfully registered!", RU: "Успешная регистрация!" },
    toast_fill_all: { AZ: "Zəhmət olmasa bütün xanaları doldurun!", TR: "Lütfen tüm alanları doldurun!", EN: "Please fill in all fields!", RU: "Пожалуйста, заполните все поля!" },
    toast_pwds_not_match: { AZ: "Şifrələr eyni deyil! Zəhmət olmasa düzgün daxil edin.", TR: "Şifreler eşleşmiyor! Lütfen doğru girin.", EN: "Passwords do not match! Please enter correctly.", RU: "Пароли не совпадают! Пожалуйста, введите правильно." },
    toast_avatar_updated: { AZ: "Profil şəkli uğurla yeniləndi!", TR: "Profil fotoğrafı başarıyla güncellendi!", EN: "Profile picture updated successfully!", RU: "Фото профиля успешно обновлено!" },
    toast_avatar_failed: { AZ: "Şəkil yüklənərkən xəta baş verdi.", TR: "Fotoğraf yüklenirken bir hata oluştu.", EN: "Error occurred while uploading picture.", RU: "Произошла ошибка при загрузке фото." },
    toast_name_required: { AZ: "Ad mütləqdir!", TR: "Ad zorunludur!", EN: "Name is required!", RU: "Имя обязательно!" },
    toast_data_saved: { AZ: "Məlumatlar yadda saxlanıldı!", TR: "Veriler kaydedildi!", EN: "Data saved!", RU: "Данные сохранены!" },
    toast_room_deleted: { AZ: "Otaq silindi.", TR: "Oda silindi.", EN: "Room deleted.", RU: "Комната удалена." },
    toast_room_create_failed: { AZ: "Otaq yaradılarkən xəta baş verdi.", TR: "Oda oluşturulurken hata oluştu.", EN: "Error creating room.", RU: "Ошибка при создании комнаты." },
    toast_enter_room_code: { AZ: "Otaq kodunu daxil edin.", TR: "Oda kodunu girin.", EN: "Enter room code.", RU: "Введите код комнаты." },
    err_invalid_email: { AZ: "Geçərsiz e-poçt ünvanı.", TR: "Geçersiz e-posta adresi.", EN: "Invalid email address.", RU: "Неверный адрес электронной почты." },
    err_user_disabled: { AZ: "İstifadəçi hesabı deaktiv edilib.", TR: "Kullanıcı hesabı devre dışı bırakıldı.", EN: "User account has been disabled.", RU: "Учетная запись пользователя отключена." },
    err_user_not_found: { AZ: "İstifadəçi tapılmadı.", TR: "Kullanıcı bulunamadı.", EN: "User not found.", RU: "Пользователь не найден." },
    err_wrong_password: { AZ: "Şifrə yanlışdır.", TR: "Şifre yanlış.", EN: "Wrong password.", RU: "Неверный пароль." },
    err_email_in_use: { AZ: "Bu e-poçt artıq istifadə olunur.", TR: "Bu e-posta zaten kullanılıyor.", EN: "This email is already in use.", RU: "Этот email уже используется." },
    err_weak_password: { AZ: "Şifrə çox zəifdir (ən az 6 simvol).", TR: "Şifre çok zayıf (en az 6 karakter).", EN: "Password is too weak (min 6 chars).", RU: "Пароль слишком слабый (мин. 6 символов)." },
    err_too_many: { AZ: "Həddən artıq cəhd! Bir az sonra yenidən yoxlayın.", TR: "Çok fazla deneme! Lütfen daha sonra tekrar deneyin.", EN: "Too many attempts! Try again later.", RU: "Слишком много попыток! Попробуйте позже." },
    err_default: { AZ: "Bir xəta baş verdi.", TR: "Bir hata oluştu.", EN: "An error occurred.", RU: "Произошла ошибка." }
};

// Evaluate the script to get dict
const regex = /const dict = (\{[\s\S]*?\n\});\n\nconst placeholders/m;
const match = content.match(regex);
if (match) {
    let dictStr = match[1];
    
    // We will inject the new keys manually using string manipulation or by eval
    let dictObj = eval('(' + dictStr + ')');
    
    for (let key in newKeys) {
        dictObj.AZ[key] = newKeys[key].AZ;
        dictObj.TR[key] = newKeys[key].TR;
        dictObj.EN[key] = newKeys[key].EN;
        dictObj.RU[key] = newKeys[key].RU;
    }
    
    const newDictStr = JSON.stringify(dictObj, null, 4);
    content = content.replace(regex, `const dict = ${newDictStr};\n\nconst placeholders`);
    fs.writeFileSync('i18n.js', content);
    console.log("Appended new keys to i18n.js");
}
