-- ====================================
-- COMPLETE FIX: Error PGRST204 Schema Cache
-- ====================================
-- Jalankan SELURUH script ini di Supabase SQL Editor
-- untuk fix semua error "Could not find column in schema cache"

-- STEP 1: DROP SEMUA TABEL (dengan CASCADE untuk handle dependencies)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ====================================
-- STEP 2: RECREATE SEMUA TABEL DENGAN STRUKTUR BENAR
-- ====================================

-- 1. LOCATIONS TABLE
CREATE TABLE locations (
  id text PRIMARY KEY,
  name text NOT NULL,
  pricing jsonb NOT NULL DEFAULT '{}'::jsonb,
  enable_delivery boolean DEFAULT false,
  delivery_fee numeric DEFAULT 0,
  enable_membership boolean DEFAULT false,
  membership_fee numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. USERS TABLE
CREATE TABLE users (
  id text PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
  location_id text REFERENCES locations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. PACKAGES TABLE
CREATE TABLE packages (
  id text PRIMARY KEY,
  tracking_number text NOT NULL,
  recipient_name text NOT NULL,
  recipient_phone text NOT NULL,
  unit_number text NOT NULL,
  courier text NOT NULL,
  size text NOT NULL CHECK (size IN ('S', 'M', 'L')),
  location_id text REFERENCES locations(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('ARRIVED', 'PICKED', 'DESTROYED')),
  dates jsonb NOT NULL DEFAULT '{}'::jsonb,
  pickup_code text,
  fee_paid numeric DEFAULT 0,
  payment_timestamp text,
  photo text,
  notification_status text DEFAULT 'PENDING' CHECK (notification_status IN ('PENDING', 'SENT', 'FAILED')),
  created_at timestamptz DEFAULT now()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone_number text NOT NULL,
  unit_number text NOT NULL,
  location_id text REFERENCES locations(id) ON DELETE CASCADE,
  is_member boolean DEFAULT false,
  membership_expiry text,
  created_at timestamptz DEFAULT now()
);

-- 5. ACTIVITIES TABLE
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

-- 6. SETTINGS TABLE
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_api_key text,
  wa_sender text,
  wa_endpoint text,
  wa_template_package text,
  wa_template_member text,
  wa_template_reminder text,
  enable_payment_gateway boolean DEFAULT false,
  landing_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ====================================
-- STEP 3: CREATE INDEXES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_packages_location_id ON packages(location_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);
CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);

-- ====================================
-- STEP 4: DISABLE RLS (untuk testing)
-- ====================================
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ====================================
-- STEP 5: INSERT INITIAL SETTINGS
-- ====================================
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

-- ====================================
-- STEP 6: REFRESH SCHEMA CACHE (PALING PENTING!)
-- ====================================
NOTIFY pgrst, 'reload schema';

-- ====================================
-- STEP 7: VERIFIKASI SEMUA TABEL
-- ====================================

-- Cek semua tabel sudah ada
SELECT 'Tables created:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('locations', 'users', 'packages', 'customers', 'activities', 'settings')
ORDER BY table_name;

-- Cek struktur locations
SELECT 'LOCATIONS columns:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'locations' 
ORDER BY ordinal_position;

-- Cek struktur users
SELECT 'USERS columns:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Cek struktur customers
SELECT 'CUSTOMERS columns:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Cek struktur settings
SELECT 'SETTINGS columns:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- Cek RLS status
SELECT 'RLS status:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('locations', 'users', 'packages', 'customers', 'activities', 'settings');

SELECT '✅ SCHEMA SETUP COMPLETE! Wait 10 seconds then refresh your app.' as final_status;
