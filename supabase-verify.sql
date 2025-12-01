-- ====================================
-- VERIFIKASI & PERBAIKAN SCHEMA SUPABASE
-- ====================================
-- Jalankan ini di Supabase SQL Editor untuk memastikan semua tabel sudah benar

-- STEP 1: CEK APAKAH SEMUA TABEL ADA
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('locations', 'users', 'packages', 'customers', 'activities', 'settings');

-- STEP 2: CEK STRUKTUR TABEL ACTIVITIES (untuk debugging error 400)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'activities'
ORDER BY ordinal_position;

-- STEP 3: JIKA TABEL ACTIVITIES TIDAK ADA ATAU STRUKTUR SALAH, DROP & RECREATE
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

-- STEP 4: DISABLE RLS UNTUK TESTING
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

-- STEP 5: DISABLE RLS (untuk development/testing)
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;

-- STEP 6: REFRESH SCHEMA CACHE SUPABASE (PENTING!)
-- Ini akan memaksa Supabase untuk reload schema setelah ALTER TABLE
NOTIFY pgrst, 'reload schema';

-- STEP 7: VERIFIKASI STRUKTUR ACTIVITIES SUDAH BENAR
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;
