<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1p9vn9zqzMJ1q_6hFk4SAXqGmCAEqwH0W

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, Supabase Account

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.local` dan pastikan isi:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

### 3. Setup Database Supabase
1. Buka Supabase SQL Editor
2. Jalankan `supabase-schema.sql` untuk create semua tabel
3. Jalankan `supabase-verify.sql` untuk insert initial settings

### 4. Run Development Server
```bash
npm run dev
```

### 5. Default Login
- **Username:** `admin`
- **Password:** `admin123`

## API (Vercel Functions)

Backend sementara disediakan via Vercel Functions di folder `api/`:
- `GET /api/settings` | `POST /api/settings`
- `GET /api/users` | `POST /api/users`
- `GET /api/locations` | `POST /api/locations`
- `GET /api/packages` | `POST /api/packages`
- `GET /api/customers` | `POST /api/customers`
- `GET /api/activities` | `POST /api/activities`

POST menerima payload full-replace (seed). Saat ini disimpan in-memory (non-persistent) dan cocok untuk demo/preview.

### Jalankan API secara lokal

1. Install Vercel CLI: `npm i -g vercel`
2. Jalankan functions: `vercel dev`
3. Jalankan Vite dev server di terminal lain: `npm run dev`

Vite sudah diproxy ke `http://localhost:3000` untuk path `/api` (lihat `vite.config.ts`).

## 🌐 Deploy ke Production (Vercel)

### 1. Push ke GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Setup Vercel
1. Import project dari GitHub di [vercel.com](https://vercel.com)
2. **Set Environment Variables:**
   - `VITE_SUPABASE_URL`: URL Supabase project Anda
   - `VITE_SUPABASE_ANON_KEY`: Anon/Public key dari Supabase
   - `VITE_APP_ENV`: `production`
3. Deploy!

### 3. Verifikasi Production
- Login dan test semua fitur
- Cek Supabase Table Editor apakah data masuk
- Monitor logs di Vercel dan Supabase

📖 **Panduan lengkap:** Lihat `PRODUCTION-GUIDE.md`

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
Buat project baru di [supabase.com](https://supabase.com)

### 2. Run SQL Schema
Di Supabase SQL Editor, jalankan berurutan:
1. `supabase-schema.sql` → Create semua tabel
2. `supabase-verify.sql` → Insert initial settings & verify

### 3. Copy Credentials
Copy URL dan Anon Key dari Supabase Settings → API ke:
- `.env.local` (untuk development)
- Vercel Environment Variables (untuk production)

### 4. Configure Security
Untuk production, **enable RLS policies** di Supabase:
```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for authenticated users" ON <table_name> FOR ALL USING (auth.role() = 'authenticated');
```

## 🏗️ Architecture

- **Frontend:** Vite + React + TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Service Layer:** `src/services/supabase.ts` dengan transformer camelCase ↔ snake_case
- **State Management:** Local Storage + Supabase sync
- **Deployment:** Vercel (frontend) + Supabase (backend)

## 🔧 Features

✅ Multi-location package management
✅ User & customer management
✅ Real-time activity logs
✅ WhatsApp notification integration
✅ Membership system
✅ Pricing engine (FLAT, PROGRESSIVE, SIZE, QUANTITY)
✅ Settings & templates management
✅ Responsive design (mobile-friendly)
