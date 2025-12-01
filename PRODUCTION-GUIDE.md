# Panduan Lengkap Menyelesaikan Pickpoint hingga Live Production

## Status Saat Ini
✅ Frontend Vite + React + TypeScript sudah lengkap
✅ Service layer dengan transformer camelCase ↔ snake_case sudah ada
✅ Supabase URL dan Anon Key sudah dikonfigurasi di `.env.local`
✅ SQL Schema untuk semua tabel sudah siap (`supabase-schema.sql`)
⚠️ Backend Supabase perlu diverifikasi dan data initial perlu ditambahkan

## Langkah-Langkah Menyelesaikan Backend

### 1. Verifikasi & Setup Tabel Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: `ihilmhzkhztzwdebtcuh`
3. Buka **SQL Editor**
4. Jalankan file `supabase-verify.sql` untuk:
   - Cek apakah semua tabel sudah ada
   - Insert initial settings (menghindari error 406)
   - Disable RLS untuk testing

5. Jika tabel belum ada, jalankan `supabase-schema.sql` LENGKAP

### 2. Verifikasi Struktur Tabel
Pastikan kolom tabel menggunakan **snake_case**:
- ✅ `enable_delivery` (bukan `enableDelivery`)
- ✅ `location_id` (bukan `locationId`)
- ✅ `tracking_number` (bukan `trackingNumber`)
- ✅ `phone_number` (bukan `phoneNumber`)
- ✅ `wa_api_key` (bukan `waApiKey`)

### 3. Test Koneksi dari Frontend
1. Jalankan dev server:
   ```bash
   npm run dev
   ```

2. Buka browser: `http://localhost:5173`

3. Login dengan default user:
   - Username: `admin`
   - Password: `admin123`

4. Masuk ke menu **Settings** (Admin only)

5. Klik tombol **"Seed to Supabase"**

6. Cek console browser untuk error. Jika berhasil, akan muncul:
   ```
   Synced: locations=2, users=3, packages=0, customers=0, activities=1, settings=1
   ```

7. Verifikasi di Supabase Dashboard → Table Editor → Cek semua tabel apakah data masuk

### 4. Troubleshooting Error Umum

#### Error 406 (Not Acceptable)
**Penyebab:** Tabel kosong atau kolom tidak match
**Solusi:**
- Jalankan `supabase-verify.sql` untuk insert initial settings
- Pastikan kolom database snake_case

#### Error 400 (Bad Request) - "Could not find column"
**Penyebab:** Nama kolom database tidak match dengan payload
**Solusi:**
- Drop dan recreate tabel dengan `supabase-schema.sql`
- Pastikan semua kolom snake_case

#### Error 401 (Unauthorized)
**Penyebab:** Anon key salah atau RLS policy terlalu ketat
**Solusi:**
- Cek `.env.local` apakah `VITE_SUPABASE_ANON_KEY` benar
- Disable RLS dengan:
  ```sql
  ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;
  ```

### 5. Deploy ke Production (Vercel)

#### A. Persiapan
1. Push semua perubahan ke GitHub:
   ```bash
   git add .
   git commit -m "Fix backend connection and ready for production"
   git push origin main
   ```

#### B. Setup di Vercel
1. Buka [Vercel Dashboard](https://vercel.com)
2. Import project dari GitHub
3. **PENTING:** Set Environment Variables:
   - `VITE_SUPABASE_URL`: `https://ihilmhzkhztzwdebtcuh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dari `.env.local`)
   - `VITE_APP_ENV`: `production`

4. Deploy!

#### C. Verifikasi Production
1. Tunggu deploy selesai
2. Buka URL production (misal: `pickpoint-dashboard.vercel.app`)
3. Test login dan seed data
4. Cek Supabase apakah data masuk

### 6. Optimasi untuk Production

#### A. Security
- **Enable RLS** di Supabase untuk production
- Buat policies yang aman:
  ```sql
  -- Contoh: hanya authenticated user bisa CRUD
  CREATE POLICY "Enable all for authenticated users only" 
  ON packages FOR ALL 
  USING (auth.role() = 'authenticated');
  ```

#### B. Performance
- Tambahkan index di kolom yang sering diquery:
  ```sql
  CREATE INDEX idx_packages_location_id ON packages(location_id);
  CREATE INDEX idx_packages_status ON packages(status);
  CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
  ```

#### C. Monitoring
- Setup Supabase logs monitoring
- Setup Vercel analytics
- Setup error tracking (optional: Sentry)

## Checklist Sebelum Go Live

- [ ] Semua tabel Supabase sudah dibuat dengan schema yang benar
- [ ] Initial settings sudah di-insert
- [ ] Test seed data dari frontend berhasil
- [ ] RLS policies sudah di-setup (atau disabled untuk testing)
- [ ] Environment variables sudah di-set di Vercel
- [ ] Deploy berhasil dan aplikasi bisa diakses
- [ ] Test login, CRUD, dan sync data di production
- [ ] Backup database (export dari Supabase)
- [ ] Domain custom sudah di-setup (optional)

## Kontak & Support
Jika ada error:
1. Cek console browser (F12 → Console)
2. Cek Supabase logs (Dashboard → Logs)
3. Cek Vercel logs (Dashboard → Deployments → Logs)
4. Cek file `storage/logs/laravel.log` jika pakai Laravel backend

## Next Steps (Opsional)
- [ ] Implement authentication dengan Supabase Auth
- [ ] Tambah fitur realtime sync (Supabase Realtime)
- [ ] Implement file upload untuk foto paket (Supabase Storage)
- [ ] Tambah email notification selain WhatsApp
- [ ] Setup backup otomatis database
- [ ] Implement multi-tenancy untuk banyak lokasi
