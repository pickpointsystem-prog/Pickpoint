-- Pickpoint Dashboard - MySQL Schema
-- Jalankan di phpMyAdmin atau CLI MySQL

-- ====================================
-- 1. LOCATIONS TABLE
-- ====================================
DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pricing JSON NOT NULL,
  enable_delivery BOOLEAN DEFAULT FALSE,
  delivery_fee DECIMAL(12,2) DEFAULT 0,
  enable_membership BOOLEAN DEFAULT FALSE,
  membership_fee DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 2. USERS TABLE
-- ====================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','STAFF') NOT NULL,
  location_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- ====================================
-- 3. PACKAGES TABLE
-- ====================================
DROP TABLE IF EXISTS packages;
CREATE TABLE packages (
  id VARCHAR(64) PRIMARY KEY,
  tracking_number VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  unit_number VARCHAR(64) NOT NULL,
  courier VARCHAR(64) NOT NULL,
  size ENUM('S','M','L') NOT NULL,
  location_id VARCHAR(64),
  status ENUM('ARRIVED','PICKED','DESTROYED') NOT NULL,
  dates JSON NOT NULL,
  pickup_code VARCHAR(32),
  fee_paid DECIMAL(12,2) DEFAULT 0,
  payment_timestamp VARCHAR(64),
  photo TEXT,
  notification_status ENUM('PENDING','SENT','FAILED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- ====================================
-- 4. CUSTOMERS TABLE
-- ====================================
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  unit_number VARCHAR(64) NOT NULL,
  location_id VARCHAR(64),
  is_member BOOLEAN DEFAULT FALSE,
  membership_expiry VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- ====================================
-- 5. ACTIVITIES TABLE
-- ====================================
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
  id VARCHAR(64) PRIMARY KEY,
  type ENUM('LOGIN','PACKAGE_ADD','PACKAGE_UPDATE','PACKAGE_PICKUP','USER_ADD','SETTINGS_UPDATE') NOT NULL,
  description TEXT NOT NULL,
  timestamp VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  related_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 6. SETTINGS TABLE
-- ====================================
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  id VARCHAR(64) PRIMARY KEY,
  wa_api_key VARCHAR(255),
  wa_sender VARCHAR(32),
  wa_endpoint VARCHAR(255),
  wa_template_package TEXT,
  wa_template_member TEXT,
  wa_template_reminder TEXT,
  enable_payment_gateway BOOLEAN DEFAULT FALSE,
  landing_config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
