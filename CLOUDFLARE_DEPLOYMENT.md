# 🚀 CodeTR Cloudflare Pages & Workers Deploy Rehberi

CodeTR platformu **Cloudflare Pages** ve **Workers** üzerinde kenar ağda (Edge Network) %100 uyumlu çalışacak şekilde yapılandırılmıştır.

---

### 📋 Yöntem 1: Cloudflare Pages (GitHub Bağlantısı ile Otomatik - TAVSİYE EDİLEN)

1. **GitHub'a Push Yapın:**
   ```bash
   git add .
   git commit -m "Cloudflare deployment setup"
   git push origin main
   ```

2. **Cloudflare Dashboard'a Gidin:**
   - [dash.cloudflare.com](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
   - **codetr** deponuzu seçin.

3. **Derleme Ayarları (Build Settings):**
   - **Framework preset:** `Next.js`
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`

4. **Environment Variables (Çevre Değişkenleri):**
   - **DATABASE_URL**: Neon PostgreSQL veritabanı url'niz (`postgresql://...`)
   - **AUTH_SECRET**: 32 Karakterlik anahtar (`npx auth secret` ile üretebilirsiniz)
   - **NEXTAUTH_URL**: `https://codetr.pages.dev`
   - **NEXT_PUBLIC_APP_URL**: `https://codetr.pages.dev`

5. **Compatibility Flags:**
   - Settings -> Functions -> Compatibility flags: `nodejs_compat` ekleyin.

---

### ⚡ Yöntem 2: Wrangler CLI İle Tek Komutla Canlıya Alma (Terminalden)

```bash
# 1. Cloudflare Girişi Yapın (İlk Kez Yapıyorsanız)
npx wrangler login

# 2. Canlıya Alın
npm run cf:deploy
```

---

### 🎯 Tebrikler!
CodeTR platformunuz `https://codetr.pages.dev` adresi altında ışık hızında yayında olacaktır!
