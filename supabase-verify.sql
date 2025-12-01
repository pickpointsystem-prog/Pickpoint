-- VERIFIKASI & PERBAIKAN SCHEMA SUPABASE
-- Jalankan ini di Supabase SQL Editor untuk memastikan semua tabel sudah benar

-- 1. CEK APAKAH SEMUA TABEL ADA
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('locations', 'users', 'packages', 'customers', 'activities', 'settings');

-- 2. JIKA BELUM ADA, JALANKAN SCHEMA LENGKAP
-- (Copas dari supabase-schema.sql yang sudah ada)

-- 3. INSERT INITIAL SETTINGS (agar tidak error 406)
INSERT INTO settings (
  id,
  wa_api_key,
  wa_sender,
  wa_endpoint,
  wa_template_package,
  wa_template_member,
  wa_template_reminder,
  enable_payment_gateway,
  landing_config
) VALUES (
  gen_random_uuid(),
  'yBMXcDk5iWz9MdEmyu8eBH2uhcytui',
  '6285777875132',
  'https://seen.getsender.id/send-message',
  'Halo *{name}*,

Paket Anda *{tracking}* telah tiba di *{location}*.

Untuk melihat Kode Ambil dan Rincian Biaya, silakan klik link berikut:
{link}

Terima kasih.',
  'Halo *{name}*,

Selamat! Membership Pickpoint Anda di *{location}* telah AKTIF hingga *{expiry}*.

Nikmati layanan pengambilan paket GRATIS biaya penyimpanan selama periode membership.

Terima kasih.',
  'Halo *{name}*,

Paket Anda *{tracking}* sudah 7 hari di *{location}*.

Mohon segera diambil untuk menghindari biaya tambahan.
{link}

Terima kasih.',
  false,
  '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFIKASI RLS POLICIES
-- Pastikan RLS disabled atau ada policy untuk public access
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- 5. JIKA PERLU DISABLE RLS (untuk development/testing)
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
