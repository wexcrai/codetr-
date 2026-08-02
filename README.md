# CodeTR — Türkiye'nin En İyi Kodlama Öğrenme Platformu

<div align="center">
  <h3>🚀 Python, JavaScript, TypeScript ve daha fazlasını Türkçe öğrenin</h3>
  <p>Mimo ve Sololearn'dan ilham alan, tamamen Türkçe, üretim hazır kodlama eğitim platformu</p>

  ![Next.js](https://img.shields.io/badge/Next.js-15-black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
  ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Geliştirme](#geliştirme)
- [Veritabanı](#veritabanı)
- [Deployment](#deployment)
- [Proje Yapısı](#proje-yapısı)

---

## ✨ Özellikler

### 🎓 Öğrenme Sistemi
- **85+ Python dersi** — 23 bölüm, başlangıçtan ileri seviyeye
- **İnteraktif ders akışı** — Açıklama → Örnek → Pratik → Zorluk → Sınav
- **Tarayıcı içi Python çalıştırma** — Pyodide (WebAssembly) ile kurulum gerektirmez
- **Monaco Editor** — VS Code'un aynı editörü, sözdizim vurgulama ve otomatik tamamlama
- **Anlık kod doğrulama** — Görünür ve gizli test durumları
- **AI Tutor** — Hata açıklama, ipucu verme, konsept anlatma
- **Sertifikalar** — İndirilebilir, doğrulanabilir tamamlama sertifikaları

### 🎮 Oyunlaştırma
- **XP Sistemi** — Her dersten, sınavdan ve zorluktan XP kazan
- **Seviyeler** — 100 seviye, artan XP eşikleri (Acemi → Efsane)
- **Günlük Seri** — Ateş animasyonlu giriş serisi takibi
- **Altın** — Kazan, ipuçları için harca
- **35+ Başarım** — 4 nadirlik seviyesi (Yaygın/Nadir/Epik/Efsanevi)
- **Günlük Ödüller** — 30 günlük artan ödül takvimi
- **Haftalık/Aylık Zorluklar**
- **Liderlik Tablosu** — Haftalık, Aylık, Tüm Zamanlar

### 👤 Kullanıcı Profili
- Özelleştirilebilir avatar ve biyografi
- XP çubuğu ve seviye rozeti
- GitHub benzeri aktivite ısı haritası (52 hafta)
- İstatistik ızgarası
- Başarım vitrini
- Kurs ilerleme takibi
- Sertifika görüntüleme ve indirme

### 🔐 Kimlik Doğrulama
- E-posta + şifre (bcrypt hashleme)
- Google, GitHub, Discord OAuth
- Şifremi unuttum / sıfırla
- Korumalı rotalar + rol tabanlı erişim (Admin/Moderatör/Kullanıcı)

### 🛠️ Admin Paneli
- Kullanıcı yönetimi (arama, filtreleme, rol değiştirme)
- Kurs/Bölüm/Ders CRUD
- Görsel ders oluşturucu (adımlar, ipuçları, test durumları)
- Sınav sorusu oluşturucu (5 soru tipi)
- Başarım yönetimi
- Analitik paneli (Recharts grafikler)

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript 5 |
| Stil | Tailwind CSS 4 |
| UI Bileşenleri | Radix UI + özel bileşenler |
| Animasyonlar | Framer Motion 12 |
| ORM | Prisma 7 |
| Veritabanı | PostgreSQL 16 |
| Kimlik Doğrulama | NextAuth v5 (Auth.js) |
| Kod Editörü | Monaco Editor |
| Python Çalıştırma | Pyodide (WebAssembly) |
| Formlar | React Hook Form + Zod |
| Grafikler | Recharts |
| Bildirimler | Sonner |
| E-posta | Resend |
| Konteynerleştirme | Docker + Docker Compose |

---

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js 20+
- Docker Desktop (PostgreSQL için)
- npm 10+

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/yourusername/codetr.git
cd codetr
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin (aşağıdaki [Ortam Değişkenleri](#ortam-değişkenleri) bölümüne bakın).

### 4. Veritabanını Başlatın

```bash
docker-compose up -d
```

### 5. Prisma Migration ve Seed

```bash
# Veritabanı tablolarını oluştur
npx prisma migrate dev --name init

# Örnek veri yükle (admin kullanıcı, Python kursu, başarımlar, günlük ödüller)
npx prisma db seed
```

### 6. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

### 7. Admin Paneline Giriş

Seed sonrası oluşturulan admin hesabı:
- **E-posta:** `admin@codetr.dev`
- **Şifre:** `Admin123!`
- **Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Ortam Değişkenleri

`.env.local` dosyasında şu değişkenleri ayarlayın:

```env
# Veritabanı (Docker Compose ile otomatik)
DATABASE_URL="postgresql://codetr:codetr_password@localhost:5432/codetr_db"

# NextAuth (en az 32 karakter rastgele string)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="buraya-en-az-32-karakterlik-guvenli-bir-anahtar"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (github.com/settings/apps)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Discord OAuth (discord.com/developers)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# E-posta (resend.com)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@codetr.dev"

# Uygulama URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Not:** Google/GitHub/Discord OAuth olmadan da çalışır — yalnızca e-posta/şifre ile giriş yapılabilir.

---

## 💻 Geliştirme

```bash
# Geliştirme sunucusu (Turbopack ile hızlı)
npm run dev

# TypeScript kontrolü
npx tsc --noEmit

# Lint
npm run lint

# Prisma Studio (veritabanı görsel arayüzü)
npx prisma studio

# Yeni migration oluştur
npx prisma migrate dev --name migration-name

# Seed'i tekrar çalıştır
npx prisma db seed
```

---

## 🗄️ Veritabanı

### Şema Özeti

```
User ─── Account (OAuth)
     ─── Session
     ─── CourseEnrollment ─── Course ─── Chapter ─── Lesson ─── LessonStep
     ─── LessonProgress                                       ─── CodeChallenge ─── TestCase
     ─── QuizAttempt ─── Quiz ─── QuizQuestion                ─── Quiz ─── QuizQuestion
     ─── Achievement (UserAchievement M-M)
     ─── Notification
     ─── Certificate
     ─── UserDailyReward
     ─── CodeSubmission
     ─── UserActivity
```

### Seed Edilen Veriler

- 1 Admin kullanıcı + 5 örnek kullanıcı
- 30 günlük ödül (artan miktarlar)
- 35+ başarım (4 nadirlik seviyesi)
- Python Programlama kursu (23 bölüm, 85 ders)
- Her ders için adımlar, ipuçları ve test durumları

---

## 🐳 Docker

```bash
# Servisleri başlat (PostgreSQL + Redis)
docker-compose up -d

# Servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f postgres

# Veritabanını sıfırla
docker-compose down -v
docker-compose up -d
```

---

## 🚢 Deployment

### Vercel (Önerilen)

1. Repoyu Vercel'e import edin
2. Ortam değişkenlerini ayarlayın
3. PostgreSQL için [Vercel Postgres](https://vercel.com/storage/postgres) veya [Neon](https://neon.tech) kullanın
4. Deploy edin

### Docker Production

```bash
docker build -t codetr .
docker run -p 3000:3000 --env-file .env.production codetr
```

---

## 📁 Proje Yapısı

```
codetr/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Kimlik doğrulama sayfaları
│   │   ├── giris/                # Giriş
│   │   ├── kayit/                # Kayıt
│   │   └── sifremi-unuttum/      # Şifre sıfırlama
│   ├── (dashboard)/              # Korumalı kullanıcı paneli
│   │   ├── panel/                # Ana panel
│   │   ├── profil/               # Kullanıcı profili
│   │   ├── liderlik/             # Liderlik tablosu
│   │   ├── basarimlar/           # Başarımlar
│   │   ├── odullerim/            # Günlük ödüller
│   │   └── ayarlar/              # Ayarlar
│   ├── kurslar/                  # Kurs sistemi
│   │   └── [slug]/               # Kurs detayı
│   │       └── ders/[id]/        # İnteraktif ders (editör)
│   ├── admin/                    # Yönetici paneli
│   ├── sertifika/                # Sertifika sayfaları
│   ├── api/                      # API rotaları
│   │   ├── auth/[...nextauth]/
│   │   ├── leaderboard/
│   │   ├── notifications/
│   │   ├── progress/
│   │   ├── search/
│   │   ├── code/submit/
│   │   └── admin/
│   ├── error.tsx                 # Hata sayfası
│   ├── not-found.tsx             # 404 sayfası
│   ├── globals.css               # Global stiller
│   └── layout.tsx                # Kök layout
├── components/
│   ├── ui/                       # Temel UI bileşenleri
│   ├── layout/                   # Navigasyon, sidebar, footer
│   ├── gamification/             # XP, başarım, seri bileşenleri
│   ├── editor/                   # Monaco editör sarmalayıcı
│   ├── certificate/              # Sertifika renderer
│   └── providers/                # Context sağlayıcıları
├── hooks/                        # Özel React hook'ları
│   ├── use-pyodide.ts            # Python çalıştırma
│   ├── use-notifications.ts      # Bildirimler
│   └── use-search.ts             # Global arama
├── lib/
│   ├── actions/                  # Server action'lar
│   │   ├── auth.ts               # Kayıt/giriş/çıkış
│   │   └── gamification.ts       # XP, ders tamamlama, ödüller
│   ├── validations/              # Zod şemaları
│   ├── db.ts                     # Prisma singleton
│   └── utils.ts                  # Yardımcı fonksiyonlar
├── prisma/
│   ├── schema.prisma             # Veritabanı şeması
│   └── seed.ts                   # Seed verisi
├── types/
│   └── next-auth.d.ts            # TypeScript tipleri
├── auth.ts                       # NextAuth yapılandırması
├── middleware.ts                 # Rota koruması
├── next.config.ts                # Next.js yapılandırması
├── tailwind.config.ts            # Tailwind yapılandırması
├── docker-compose.yml            # Docker servisleri
├── Dockerfile                    # Production Docker imajı
└── .env.example                  # Örnek ortam değişkenleri
```

---

## 🎨 Tasarım Sistemi

- **Renk Paleti:** Koyu #0A0F1E arkaplan, Mavi #3B82F6, Mor #8B5CF6 gradyanlar
- **Cam Morfizm:** `glass-card` CSS sınıfı ile blur + opaklık efektleri
- **Animasyonlar:** Framer Motion, CSS @keyframes
- **Tipografi:** Inter (UI) + JetBrains Mono (kod)
- **İkonlar:** Lucide React
- **Tema:** Koyu (varsayılan) / Açık / Sistem

---

## 📄 Lisans

MIT License — Özgürce kullanın, değiştirin ve dağıtın.

---

<div align="center">
  <p>CodeTR ile kodlamayı sevin ❤️</p>
  <p>Sorularınız için <a href="mailto:destek@codetr.dev">destek@codetr.dev</a></p>
</div>
