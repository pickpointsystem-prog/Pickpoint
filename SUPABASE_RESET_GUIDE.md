# RESET SUPABASE DATABASE

## Instruksi Step-by-Step

### 1. Akses Supabase SQL Editor
1. Buka browser: https://app.supabase.com
2. Login dengan akun Supabase Anda
3. Pilih project: **ihilmhzkhztzwdebtcuh**
4. Klik menu **SQL Editor** di sidebar kiri

### 2. Jalankan Reset Script
1. Klik **New Query** atau buka tab baru
2. Copy seluruh isi file **supabase-reset.sql** dari project
3. Paste ke SQL Editor
4. Klik tombol **Run** (atau tekan Ctrl+Enter)
5. Tunggu hingga selesai (biasanya 5-10 detik)

### 3. Verifikasi Hasil
Setelah berhasil jalankan query:
- Semua tables lama akan dihapus (locations, users, packages, customers, activities, settings)
- Tables baru akan dibuat dengan schema yang benar
- Data default sudah terinsert:
  - Location: "Demo Location" (id: loc_demo)
  - User Admin: username=admin, password=admin123
  - Settings template WhatsApp

### 4. Cek Tabel di Table Editor
1. Klik **Table Editor** di sidebar
2. Verify semua tabel ada:
   - locations
   - users
   - packages
   - customers
   - activities
   - settings

### 5. Siap untuk Build & Test
Database sudah clean dan siap. Lanjut ke:
- `npm run build`
- Test login dengan **admin / admin123**

---

## Jika Ada Error

**Error: "relation already exists"**
- Kemungkinan ada data lama
- Solution: Jalankan DROP query terlebih dahulu (sudah ada di script)

**Error: "permission denied"**
- Supabase user tidak punya akses drop table
- Solution: Gunakan akses Admin/Owner project

**Error: "no permission for RLS"**
- Jalankan bagian RLS dengan akses higher privilege

---

## Koneksi String
```
URL: https://ihilmhzkhztzwdebtcuh.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sudah tersimpan di `.env.local` aplikasi.

---

## Login Credentials (Setelah Reset)
```
Username: admin
Password: admin123
Role: ADMIN
```

---

Hubungi developer jika ada issues dengan SQL script.
