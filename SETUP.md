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

`FIREBASE_SERVICE_ACCOUNT` əvəzinə ayrı-ayrı `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` də istifadə edilə bilər.

### EmailJS üçün əlavə addım

EmailJS panelində **Account → Security → "Allow API calls from non-browser
applications"** seçimini aktiv edin. Kod artıq serverdə yaradılır və serverdən
göndərilir — bu, brauzerin kodu bilməsinin qarşısını alır.

**Əgər bu dəyişənlər təyin edilməyibsə:** şifrə bərpası avtomatik olaraq
Firebase-in öz bərpa məktubuna keçir (istifadəçiyə link gəlir). Sayt işləməyə
davam edir, sadəcə 6 rəqəmli kod axını əvəzinə link axını olur.

---

## Realtime Database qaydaları

Aşağıdakı qaydalar `otaqlarım` sorğusunun indeksdən istifadə etməsi üçün lazımdır
(indeks olmadan da işləyir, sadəcə konsolda xəbərdarlıq verir və yavaş olur):

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
