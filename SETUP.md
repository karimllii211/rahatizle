# Rahat İzle — Quraşdırma

## ⚠️ TƏCİLİ: Sızmış açarı ləğv edin

`api/reset-password.js` faylında Firebase Admin **service account private key** açıq
şəkildə yazılmışdı və Git tarixçəsinə düşmüşdü. Kod artıq təmizlənib, lakin
**açarın özü hələ də etibarsızdır** — Git tarixçəsində qalır.

Bunu mən sizin əvəzinizə edə bilmərəm, özünüz etməlisiniz:

1. [Firebase Console → Project Settings → Service accounts](https://console.firebase.google.com/project/rahatizle-yeni/settings/serviceaccounts/adminsdk)
2. Köhnə açarı **silin/ləğv edin** (`firebase-adminsdk-fbsvc@rahatizle-yeni.iam.gserviceaccount.com`).
3. Yeni açar yaradın və aşağıdakı `FIREBASE_SERVICE_ACCOUNT` dəyişəninə yazın.

Eyni şəkildə TURN serverinin parolu (`Video2026!`) da repodadır — dəyişdirin.

---

## Environment dəyişənləri (Vercel → Settings → Environment Variables)

| Ad | Təsvir |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Yeni service account JSON faylının **tam məzmunu** (bir sətir) |
| `RESET_TOKEN_SECRET` | Təsadüfi gizli açar. Yaratmaq üçün: `openssl rand -base64 48` |
| `EMAILJS_SERVICE_ID` | EmailJS servis ID (`service_...`) |
| `EMAILJS_TEMPLATE_ID` | EmailJS şablon ID (`template_...`) |
| `EMAILJS_PUBLIC_KEY` | EmailJS Public Key |
| `EMAILJS_PRIVATE_KEY` | EmailJS **Private Key** (Account → API Keys) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 açarı (Google Cloud Console) — otaqda YouTube axtarışı üçün |

`FIREBASE_SERVICE_ACCOUNT` əvəzinə ayrı-ayrı `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` də istifadə edilə bilər.

### ⚠️ YouTube açarı da sızmışdı

`room.js`-də sərt-kodlanmış bir YouTube Data API v3 açarı var idi (Git
tarixçəsinə düşüb). Artıq koddan silinib və `/api/youtube-search` serverless
funksiyası vasitəsilə server tərəfdə istifadə olunur, amma **köhnə açarın özü
hələ də etibarsızdır**. Google Cloud Console-da (APIs & Services → Credentials)
həmin açarı ləğv edin, yenisini yaradın və yalnız `YOUTUBE_API_KEY` kimi
təyin edin — koda yazmayın.

`YOUTUBE_API_KEY` təyin edilməyibsə, otaqdakı YouTube axtarışı "Axtarış
xidməti hazırda əlçatan deyil" xətası göstərir — heç bir fallback yoxdur.

### EmailJS üçün əlavə addım

EmailJS panelində **Account → Security → "Allow API calls from non-browser
applications"** seçimini aktiv edin. Kod artıq serverdə yaradılır və serverdən
göndərilir — bu, brauzerin kodu bilməsinin qarşısını alır.

**Əgər bu dəyişənlər təyin edilməyibsə:** şifrə bərpası, şifrə dəyişikliyi və
email dəyişikliyi — hər üçü — kodu göndərə bilmir və istifadəçiyə "Kod
göndərilə bilmədi, bir az sonra yenidən cəhd edin" xətası göstərilir. Heç bir
ehtiyat (fallback) yolu yoxdur — bu dəyişənlər olmadan bu üç funksiya işləmir.

### Email dəyişikliyi üçün ayrı endpoint

`api/verify-email-otp.js` eyni EmailJS dəyişənlərindən istifadə edir, amma
Firebase Admin SDK-ya ehtiyac duymur — o, yalnız istifadəçinin yeni e-poçt
ünvanına sahib olduğunu təsdiqləyir, faktiki email yeniləməsi (`updateEmail`)
brauzerdə, artıq daxil olmuş Firebase sessiyası ilə baş verir. Paylaşılan
OTP məntiqi (`api/_otp.js`) hər iki endpoint tərəfindən istifadə olunur.

---

## Realtime Database qaydaları

Aşağıdakı qaydalar `otaqlarım` sorğusunun (profil səhifəsindəki otaq siyahısı
və hesab silinərkən "öz otaqlarını tap" sorğusu) indeksdən istifadə etməsi
üçün lazımdır (indeks olmadan da işləyir, sadəcə konsolda xəbərdarlıq verir
və yavaş olur):

```json
{
  "rules": {
    "rooms": {
      ".indexOn": ["creator/uid"]
    }
  }
}
```

> Qeyd: bazanın strukturuna toxunulmayıb — bu, yalnız indeks tövsiyəsidir.

### Hesab silinməsinin əhatəsi

Hesab silinərkən istifadəçinin **yaratdığı otaqlar** (və içindəki bütün
chat/izləyici/siqnal məlumatı) və profil qeydi silinir. Bilərəkdən buraxılan
hissə: istifadəçinin **başqalarının otaqlarında** yazdığı mesajlar və orada
qalan izləyici qeydləri təmizlənmir — bunları tapmaq üçün bazada indeks yoxdur,
tam skan bahalı olardı və mövcud təhlükəsizlik qaydaları ilə bloklana bilər.

---

## Lokal inkişaf

```bash
npm install
npm run build:css     # styles.css yaradır
npm run watch:css     # dəyişiklikləri izləyir
```

`styles.css` avtomatik yaradılan fayldır. **HTML-də sinif adı dəyişdirdikdən sonra
mütləq `npm run build:css` işlədin** — əks halda yeni Tailwind sinifləri CSS-də
olmayacaq.

Stil mənbəyi: `src/input.css`. Bütün animasiyalar və mobil qaydalar oradadır.
