# 🔴 FIX Error 400/406 - Activities Table

## 🚨 ERROR YANG TERJADI

```
POST https://ihilmhzkhztzwdebtcuh.supabase.co/rest/v1/activities 400 (Bad Request)
[Supabase] Insert activity error: {
  code: 'PGRST204', 
  message: "Could not find the 'user_id' column of 'activities' in the schema cache"
}
```

---

## 🎯 ROOT CAUSE

**Supabase schema cache belum di-refresh** setelah create/alter table, atau **tabel activities tidak ter-create dengan benar**.

Error code `PGRST204` = Supabase PostgREST tidak bisa find kolom di schema cache-nya.

---

## ✅ SOLUSI CEPAT (2 Menit)

### **Option 1: Run SQL di Supabase Dashboard** (RECOMMENDED)

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Pilih project: `ihilmhzkhztzwdebtcuh`

2. **Buka SQL Editor**
   - Klik **SQL Editor** di sidebar kiri

3. **Jalankan Script Berikut:**

```sql
-- DROP dan RECREATE table activities dengan struktur yang benar
DROP TABLE IF EXISTS activities CASCADE;

CREATE TABLE activities (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('LOGIN', 'PACKAGE_ADD', 'PACKAGE_UPDATE', 'PACKAGE_PICKUP', 'USER_ADD', 'SETTINGS_UPDATE')),
  description text NOT NULL,
  timestamp text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  related_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);

-- Disable RLS untuk testing
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- PENTING: Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

4. **Klik Run** (atau Ctrl+Enter)

5. **Tunggu 5-10 detik** untuk schema cache refresh

6. **Test lagi di aplikasi**
   - Refresh browser
   - Login kembali
   - Error seharusnya hilang

---

## 🔍 VERIFIKASI

### Cek struktur tabel sudah benar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;
```

**Expected output:**
```
id          | text          | NO
type        | text          | NO
description | text          | NO
timestamp   | text          | NO
user_id     | text          | NO
user_name   | text          | NO
related_id  | text          | YES
created_at  | timestamptz   | YES
```

✅ Pastikan `user_id`, `user_name`, `related_id` ada (snake_case, bukan camelCase)

---

## 📋 JIKA MASIH ERROR

### Option 2: Full Schema Reset

Jika Option 1 tidak berhasil, jalankan **full schema** dari awal:

1. **Backup data existing** (jika ada):
```sql
-- Export ke JSON (optional)
SELECT json_agg(row_to_json(t)) FROM packages t;
SELECT json_agg(row_to_json(t)) FROM customers t;
```

2. **Drop semua tabel**:
```sql
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
```

3. **Run full schema**:
   - Copy paste seluruh isi file `supabase-schema.sql`
   - Klik Run

4. **Run verify script**:
   - Copy paste seluruh isi file `supabase-verify.sql` (yang sudah di-update)
   - Klik Run

5. **Wait 10 seconds** untuk schema cache refresh

6. **Test di aplikasi**

---

## 🔧 PENJELASAN TEKNIS

### Kenapa error ini terjadi?

1. **Schema cache PostgREST**: Supabase menggunakan PostgREST untuk API. PostgREST cache schema untuk performance.

2. **Cache tidak auto-refresh**: Saat Anda ALTER TABLE atau CREATE TABLE, cache tidak langsung update.

3. **Frontend kirim `user_id`**: Transformer di frontend sudah benar convert `userId` → `user_id`

4. **PostgREST cari di cache lama**: Cache masih ingat struktur lama (atau tidak ada strukturnya), makanya error "Could not find column"

### Solusi:
- ✅ **NOTIFY pgrst, 'reload schema'** → Force refresh cache
- ✅ **DROP CASCADE + CREATE** → Ensure struktur fresh dan benar
- ✅ **Wait 5-10 detik** → Beri waktu cache reload

---

## 🎯 CHECKLIST FINAL

Setelah jalankan SQL di atas:

- [ ] Table `activities` sudah ada (cek di Table Editor)
- [ ] Kolom `user_id`, `user_name`, `related_id` ada (snake_case)
- [ ] RLS disabled untuk testing
- [ ] Tunggu 10 detik setelah run SQL
- [ ] Refresh browser
- [ ] Login kembali
- [ ] Test operasi (add package, update settings)
- [ ] Cek console browser - tidak ada error 400

---

## 📞 JIKA MASIH ERROR

Screenshot dan share:
1. Output dari query verifikasi struktur tabel
2. Full error message di browser console
3. Network tab request/response (F12 → Network → klik request yang error)

---

## ✅ UPDATE FILE

Saya sudah update file `supabase-verify.sql` dengan:
- ✅ Recreate activities table
- ✅ Add NOTIFY command untuk refresh cache
- ✅ Verification queries
- ✅ IF EXISTS checks

**Next:** Jalankan `supabase-verify.sql` di Supabase SQL Editor sekarang!
