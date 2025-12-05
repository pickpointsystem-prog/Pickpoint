-- RESET SUPABASE DATABASE
-- Jalankan script ini di Supabase SQL Editor untuk drop semua tables dan reset ke kondisi bersih

-- ====================================
-- DROP SEMUA TABLES (CASCADE)
-- ====================================
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- DROP FUNCTIONS & TRIGGERS
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ====================================
-- RECREATE SEMUA TABLES
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

CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger untuk auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- DISABLE RLS (FULL PUBLIC ACCESS)
-- ====================================
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ====================================
-- INSERT INITIAL DATA
-- ====================================

-- Default Location
INSERT INTO locations (id, name, pricing) VALUES 
('loc_demo', 'Demo Location', '{"type":"FLAT","amount":10000}');

-- Default Admin User
INSERT INTO users (id, username, password, name, role, location_id) VALUES 
('user_admin', 'admin', 'admin123', 'Admin User', 'ADMIN', 'loc_demo');

-- Settings Template
INSERT INTO settings (wa_api_key, wa_sender, wa_endpoint, wa_template_package) VALUES 
('dummy-key', 'Pickpoint', 'https://api.whatsapp.com', 'Halo {name}, paket Anda ({tracking}) sudah tiba di {location}. Klik: {link}');

-- ====================================
-- SELESAI
-- ====================================
-- Database sudah direset dan siap digunakan
-- Default login: admin / admin123
