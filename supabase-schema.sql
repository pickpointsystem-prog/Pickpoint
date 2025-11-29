-- Supabase schema for Pickpoint
-- Run each section in Supabase SQL editor
-- Adjust names/types if you evolve TypeScript interfaces

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- LOCATIONS
create table if not exists locations (
  id text primary key,
  name text not null,
  pricing jsonb not null,
  enableDelivery boolean default false,
  deliveryFee numeric default 0,
  enableMembership boolean default false,
  membershipFee numeric default 0
);

-- USERS
create table if not exists users (
  id text primary key,
  username text not null unique,
  password text, -- WARNING: do NOT store plain text in production
  name text not null,
  role text check (role in ('ADMIN','STAFF')) not null,
  locationId text references locations(id) on delete set null
);

-- PACKAGES
create table if not exists packages (
  id text primary key,
  trackingNumber text not null,
  recipientName text not null,
  recipientPhone text not null,
  unitNumber text not null,
  courier text not null,
  size text check (size in ('S','M','L')) not null,
  locationId text references locations(id) on delete cascade,
  status text check (status in ('ARRIVED','PICKED','DESTROYED')) not null,
  dates jsonb not null, -- { arrived, picked?, destroyed? }
  pickupCode text not null,
  feePaid numeric default 0,
  photo text, -- base64 or URL
  notificationStatus text check (notificationStatus in ('PENDING','SENT','FAILED')) not null,
  created_at timestamptz default now()
);

-- CUSTOMERS
create table if not exists customers (
  id text primary key,
  name text not null,
  phoneNumber text not null,
  unitNumber text not null,
  locationId text references locations(id) on delete cascade,
  isMember boolean default false,
  membershipExpiry timestamptz
);

-- SETTINGS (single row recommended; use id = 'global')
create table if not exists settings (
  id text primary key,
  waApiKey text,
  waSender text,
  waEndpoint text,
  waTemplatePackage text,
  waTemplateMember text,
  waTemplateReminder text,
  enablePaymentGateway boolean default false,
  updatedAt timestamptz default now()
);

-- ACTIVITIES
create table if not exists activities (
  id text primary key,
  type text check (type in ('LOGIN','PACKAGE_ADD','PACKAGE_UPDATE','PACKAGE_PICKUP','USER_ADD','SETTINGS_UPDATE')) not null,
  description text not null,
  timestamp timestamptz default now(),
  userId text references users(id) on delete set null,
  userName text not null,
  relatedId text,
  meta jsonb
);

-- Useful indexes
create index if not exists idx_packages_tracking on packages(trackingNumber);
create index if not exists idx_packages_location on packages(locationId);
create index if not exists idx_customers_location on customers(locationId);
create index if not exists idx_activities_type on activities(type);

-- Row Level Security (RLS) - enable then add policies as needed
alter table users enable row level security;
alter table locations enable row level security;
alter table packages enable row level security;
alter table customers enable row level security;
alter table settings enable row level security;
alter table activities enable row level security;

-- Example permissive policies (adjust for production security)
create policy "Public read users" on users for select using (true);
create policy "Public read locations" on locations for select using (true);
create policy "Public read packages" on packages for select using (true);
create policy "Public read customers" on customers for select using (true);
create policy "Public read settings" on settings for select using (true);
create policy "Public read activities" on activities for select using (true);

-- Upsert friendly: ensure primary keys from app are unique
-- App generates IDs as strings; you can switch to uuid by updating code and using uuid_generate_v4().

-- Seed sample data for quick validation (safe: skips if id exists)
insert into locations (id, name, pricing, enableDelivery, deliveryFee, enableMembership, membershipFee)
values ('loc-1', 'Main Lobby', '{"type":"FLAT","gracePeriodDays":0,"flatRate":10000}', false, 0, false, 0)
on conflict (id) do nothing;

insert into users (id, username, password, name, role, locationId)
values ('user-1', 'admin', NULL, 'Administrator', 'ADMIN', 'loc-1')
on conflict (id) do nothing;
