# ✅ Deployment Checklist - Pickpoint Dashboard

## Status Project: SIAP DEPLOY 🚀

### ✅ Pre-Deployment (SUDAH SELESAI)
- [x] Build production berhasil tanpa error
- [x] Konfigurasi environment sudah benar
- [x] TypeScript compilation sukses
- [x] Supabase credentials tersedia di `.env.local`

---

## 📋 LANGKAH DEPLOYMENT KE PRODUCTION

### **STEP 1: Setup Database Supabase**

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login dengan akun Anda
   - Pilih project: `ihilmhzkhztzwdebtcuh`

2. **Jalankan SQL Schema**
   - Buka **SQL Editor** di sidebar
   - Copy paste seluruh isi file `supabase-schema.sql`
   - Klik **Run** untuk membuat semua tabel

3. **Setup Initial Data**
   - Di SQL Editor, copy paste isi file `supabase-verify.sql`
   - Klik **Run** untuk insert initial settings
   - Verifikasi di **Table Editor** bahwa tabel `settings` sudah ada data

4. **Disable RLS untuk Testing** (Opsional untuk tahap awal)
   ```sql
   ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
   ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
   ```

---

### **STEP 2: Push ke GitHub**

```bash
# Pastikan semua perubahan sudah saved
git status

# Add semua file yang berubah
git add .

# Commit dengan pesan yang jelas
git commit -m "Ready for production deployment"

# Push ke repository
git push origin main
```

---

### **STEP 3: Deploy ke Vercel**

#### A. Buka Vercel Dashboard
1. Pergi ke https://vercel.com
2. Login dengan akun GitHub Anda
3. Klik **"Add New Project"**

#### B. Import Repository
1. Pilih repository: **pickpointsystem-prog/Pickpoint**
2. Klik **"Import"**
3. Framework akan terdeteksi otomatis sebagai **Vite**

#### C. Configure Project
**PENTING:** Set Environment Variables berikut:

```
VITE_SUPABASE_URL = https://ihilmhzkhztzwdebtcuh.supabase.co

VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaWxtaHpraHp0endkZWJ0Y3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjA1NzgsImV4cCI6MjA4MDEzNjU3OH0.HapmMz0SezGwvapvKDjhGNTzxHIwin-UVl0CtIVQD4Y

VITE_APP_ENV = production
```

#### D. Deploy
1. Klik **"Deploy"**
2. Tunggu proses build selesai (±2-3 menit)
3. Vercel akan memberikan URL production (contoh: `pickpoint-dashboard.vercel.app`)

---

### **STEP 4: Verifikasi Production**

1. **Buka URL Production**
   - Klik URL yang diberikan Vercel
   - Pastikan aplikasi loading dengan benar

2. **Test Login**
   - Username: `admin`
   - Password: `admin123`

3. **Seed Initial Data**
   - Masuk ke menu **Settings** (hanya admin)
   - Klik tombol **"Seed to Supabase"**
   - Cek console browser (F12 → Console) untuk memastikan tidak ada error
   - Verifikasi di Supabase Table Editor bahwa data masuk

4. **Test CRUD Operations**
   - Buat paket baru di menu **Packages**
   - Tambah customer di menu **Customers**
   - Cek log aktivitas di menu **Reports**

---

## 🔒 Post-Deployment (Security)

### Enable RLS Policies (Setelah testing berhasil)
```sql
-- Enable RLS untuk semua tabel
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Contoh policy: authenticated users bisa akses semua
CREATE POLICY "Enable all for authenticated users" 
ON packages FOR ALL 
USING (true);  -- Adjust sesuai kebutuhan security Anda
```

---

## 📊 Monitoring & Maintenance

### Monitoring
- **Vercel Logs**: https://vercel.com/dashboard → Project → Deployments → Logs
- **Supabase Logs**: Supabase Dashboard → Logs
- **Error Tracking**: Cek browser console untuk frontend errors

### Backup Database
```sql
-- Jalankan di Supabase SQL Editor untuk export data
SELECT * FROM locations;
SELECT * FROM users;
SELECT * FROM packages;
SELECT * FROM customers;
SELECT * FROM activities;
SELECT * FROM settings;
```

---

## 🎯 Custom Domain (Opsional)

Jika ingin menggunakan domain sendiri:

1. **Di Vercel Dashboard**
   - Pilih project
   - Klik **"Settings"** → **"Domains"**
   - Tambahkan domain Anda (contoh: `admin.pickpoint.my.id`)

2. **Di DNS Provider**
   - Tambahkan CNAME record:
     ```
     CNAME  admin  cname.vercel-dns.com
     ```

3. **Tunggu propagasi DNS** (5-30 menit)

---

## 📞 Troubleshooting

### Error 406 "Not Acceptable"
- **Penyebab**: Tabel kosong atau RLS policy terlalu ketat
- **Solusi**: Jalankan `supabase-verify.sql` atau disable RLS

### Build Failed di Vercel
- **Penyebab**: Environment variables belum di-set
- **Solusi**: Cek Settings → Environment Variables

### Data tidak muncul setelah seed
- **Penyebab**: Anon key salah atau RLS policy memblokir
- **Solusi**: Verifikasi environment variables, disable RLS sementara

### WhatsApp notification tidak terkirim
- **Penyebab**: API key atau endpoint belum valid
- **Solusi**: Update settings via menu Settings setelah deploy

---

## ✅ CHECKLIST AKHIR

- [ ] Database Supabase sudah setup lengkap
- [ ] Initial settings sudah di-insert
- [ ] Code sudah di-push ke GitHub
- [ ] Environment variables sudah di-set di Vercel
- [ ] Deploy berhasil dan aplikasi bisa diakses
- [ ] Test login berhasil
- [ ] Seed data berhasil
- [ ] CRUD operations berjalan normal
- [ ] RLS policies sudah di-setup (atau disabled untuk testing)

---

## 🎉 PROJECT LIVE!

Selamat! Pickpoint Dashboard Anda sudah live di production.

**Production URL**: https://pickpoint-dashboard.vercel.app (atau custom domain Anda)

**Default Login**:
- Username: `admin`
- Password: `admin123`

**⚠️ PENTING**: Ganti password default setelah deploy!
