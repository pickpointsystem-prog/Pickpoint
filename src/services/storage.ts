import { User, Location, Package, Customer, AppSettings, ActivityLog } from '../types';
import { INITIAL_USERS, INITIAL_LOCATIONS, INITIAL_SETTINGS, SEED_KEYS, INITIAL_CUSTOMERS } from '../constants';
import config from '../config/environment';
import { SupabaseService } from './supabase';

// Add environment prefix to storage keys
const prefixKey = (key: string): string => `${config.storagePrefix}${key}`;

// Helper to get from storage safely with environment prefix
function get<T>(key: string, defaultVal: T): T {
  try {
    const prefixedKey = prefixKey(key);
    const item = localStorage.getItem(prefixedKey);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

// Helper to set storage with environment prefix
function set(key: string, value: any) {
  const prefixedKey = prefixKey(key);
  localStorage.setItem(prefixedKey, JSON.stringify(value));
  
  if (config.enableDebugMode) {
    console.log(`💾 Storage [${config.env}]:`, { key: prefixedKey, itemCount: Array.isArray(value) ? value.length : 1 });
  }
}

type SupabaseTableKey = 'users' | 'locations' | 'packages' | 'customers' | 'settings' | 'activities';

const syncToSupabase = <T extends Record<string, any>>(table: SupabaseTableKey, payload: T[]) => {
  if (!SupabaseService.isReady() || payload.length === 0) return;
  SupabaseService.upsertTable(table, payload);
};

export const StorageService = {
  init: () => {
    // Migration-aware seeding: ensure prefixed keys exist. If legacy (unprefixed) data exists, migrate it.
    const ensure = (key: string, initialValue: any) => {
      const legacy = localStorage.getItem(key); // old unprefixed
      const prefixed = localStorage.getItem(prefixKey(key));
      if (!prefixed) {
        if (legacy) {
          // Migrate legacy data into new prefixed key
            try {
              const parsed = JSON.parse(legacy);
              set(key, parsed);
              if (config.enableDebugMode) console.log(`🔄 Migrated legacy storage key '${key}' to '${prefixKey(key)}'`);
            } catch {
              set(key, initialValue);
              if (config.enableDebugMode) console.log(`⚠️ Failed parsing legacy key '${key}', seeded initial value.`);
            }
        } else {
          // Seed fresh
          set(key, initialValue);
        }
      }
    };

    ensure(SEED_KEYS.USERS, INITIAL_USERS);
    ensure(SEED_KEYS.LOCATIONS, INITIAL_LOCATIONS);
    ensure(SEED_KEYS.SETTINGS, INITIAL_SETTINGS);
    ensure(SEED_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    ensure(SEED_KEYS.PACKAGES, []);
    ensure(SEED_KEYS.ACTIVITIES, []);

    const seedFromSupabase = async () => {
      if (!SupabaseService.isReady()) return;
      const remote = await SupabaseService.fetchAllData();
      if (!remote) return;
      if (remote.users.length) set(SEED_KEYS.USERS, remote.users);
      if (remote.locations.length) set(SEED_KEYS.LOCATIONS, remote.locations);
      if (remote.packages.length) set(SEED_KEYS.PACKAGES, remote.packages);
      if (remote.customers.length) set(SEED_KEYS.CUSTOMERS, remote.customers);
      if (remote.activities.length) set(SEED_KEYS.ACTIVITIES, remote.activities);
      if (remote.settings) set(SEED_KEYS.SETTINGS, { ...INITIAL_SETTINGS, ...remote.settings });
    };

    seedFromSupabase();
  },

  // Users
  getUsers: (): User[] => {
    const users = get<User[]>(SEED_KEYS.USERS, []);
    if (users.length === 0) {
      // Fallback: try legacy key if exists (helps if init not called yet)
      try {
        const legacy = localStorage.getItem(SEED_KEYS.USERS);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length) return parsed;
        }
      } catch {}
    }
    return users;
  },
  saveUser: (user: User) => {
    const users = get<User[]>(SEED_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    set(SEED_KEYS.USERS, users);
    syncToSupabase('users', users);
  },
  deleteUser: (id: string) => {
    const users = get<User[]>(SEED_KEYS.USERS, []);
    const filtered = users.filter(u => u.id !== id);
    set(SEED_KEYS.USERS, filtered);
    syncToSupabase('users', filtered);
  },

  // Locations
  getLocations: (): Location[] => get(SEED_KEYS.LOCATIONS, []),
  getLocation: (id: string): Location | undefined => get<Location[]>(SEED_KEYS.LOCATIONS, []).find(l => l.id === id),
  saveLocation: (loc: Location) => {
    const locs = get<Location[]>(SEED_KEYS.LOCATIONS, []);
    const idx = locs.findIndex(l => l.id === loc.id);
    if (idx >= 0) locs[idx] = loc;
    else locs.push(loc);
    set(SEED_KEYS.LOCATIONS, locs);
    syncToSupabase('locations', locs);
  },
  deleteLocation: (id: string) => {
    const locs = get<Location[]>(SEED_KEYS.LOCATIONS, []);
    const filtered = locs.filter(l => l.id !== id);
    set(SEED_KEYS.LOCATIONS, filtered);
    syncToSupabase('locations', filtered);
  },

  // Packages
  getPackages: (): Package[] => get(SEED_KEYS.PACKAGES, []),
  savePackage: (pkg: Package) => {
    const pkgs = get<Package[]>(SEED_KEYS.PACKAGES, []);
    const idx = pkgs.findIndex(p => p.id === pkg.id);
    if (idx >= 0) pkgs[idx] = pkg;
    else pkgs.push(pkg);
    set(SEED_KEYS.PACKAGES, pkgs);
    syncToSupabase('packages', pkgs);
  },

  // Customers
  getCustomers: (): Customer[] => get(SEED_KEYS.CUSTOMERS, []),
  saveCustomer: (cust: Customer) => {
    const custs = get<Customer[]>(SEED_KEYS.CUSTOMERS, []);
    const idx = custs.findIndex(c => c.id === cust.id);
    if (idx >= 0) custs[idx] = cust;
    else custs.push(cust);
    set(SEED_KEYS.CUSTOMERS, custs);
    syncToSupabase('customers', custs);
  },
  deleteCustomer: (id: string) => {
    const custs = get<Customer[]>(SEED_KEYS.CUSTOMERS, []);
    const filtered = custs.filter(c => c.id !== id);
    set(SEED_KEYS.CUSTOMERS, filtered);
    syncToSupabase('customers', filtered);
  },

  // Settings with Self-Healing/Migration for new keys
  getSettings: (): AppSettings => {
    const saved = get<AppSettings>(SEED_KEYS.SETTINGS, INITIAL_SETTINGS);
    // Merge with INITIAL_SETTINGS to ensure new keys (like templates) exist if user has old data
    return { ...INITIAL_SETTINGS, ...saved };
  },
  saveSettings: (s: AppSettings) => {
    set(SEED_KEYS.SETTINGS, s);
    syncToSupabase('settings', [s]);
  },

  // Activities
  getActivities: (): ActivityLog[] => get(SEED_KEYS.ACTIVITIES, []),
  addActivity: (activity: ActivityLog) => {
    const logs = get<ActivityLog[]>(SEED_KEYS.ACTIVITIES, []);
    logs.unshift(activity); // Add to top
    // Keep only last 1000 activities
    if (logs.length > 1000) logs.length = 1000;
    set(SEED_KEYS.ACTIVITIES, logs);
    SupabaseService.insertActivity(activity);
  },

  // Manual full sync to Supabase (one-click seed)
  syncAllToSupabase: async () => {
    if (!SupabaseService.isReady()) {
      return { ok: false, message: 'Supabase not configured' };
    }

    const users = get<User[]>(SEED_KEYS.USERS, []);
    const locations = get<Location[]>(SEED_KEYS.LOCATIONS, []);
    const packages = get<Package[]>(SEED_KEYS.PACKAGES, []);
    const customers = get<Customer[]>(SEED_KEYS.CUSTOMERS, []);
    const activities = get<ActivityLog[]>(SEED_KEYS.ACTIVITIES, []);
    const settings = get<AppSettings>(SEED_KEYS.SETTINGS, INITIAL_SETTINGS);

    try {
      // Sequential upsert to respect foreign key dependencies
      // 1. Settings first (no dependencies)
      const settingsResult = await SupabaseService.upsertTable('settings', [settings]);
      if (!settingsResult.success) {
        return { ok: false, message: `Settings sync failed: ${settingsResult.error}` };
      }

      // 2. Locations (no dependencies)
      const locationsResult = await SupabaseService.upsertTable('locations', locations);
      if (!locationsResult.success) {
        return { ok: false, message: `Locations sync failed: ${locationsResult.error}` };
      }

      // 3. Users (depends on locations)
      const usersResult = await SupabaseService.upsertTable('users', users);
      if (!usersResult.success) {
        return { ok: false, message: `Users sync failed: ${usersResult.error}` };
      }

      // 4. Customers (depends on locations)
      const customersResult = await SupabaseService.upsertTable('customers', customers);
      if (!customersResult.success) {
        return { ok: false, message: `Customers sync failed: ${customersResult.error}` };
      }

      // 5. Packages (depends on locations)
      const packagesResult = await SupabaseService.upsertTable('packages', packages);
      if (!packagesResult.success) {
        return { ok: false, message: `Packages sync failed: ${packagesResult.error}` };
      }

      // 6. Activities (no foreign key dependencies)
      const activitiesResult = await SupabaseService.upsertTable('activities', activities);
      if (!activitiesResult.success) {
        return { ok: false, message: `Activities sync failed: ${activitiesResult.error}` };
      }

      return {
        ok: true,
        counts: {
          locations: locations.length,
          users: users.length,
          packages: packages.length,
          customers: customers.length,
          activities: activities.length,
          settings: 1,
        }
      };
    } catch (e: any) {
      return { ok: false, message: e.message || 'Sync failed' };
    }
  },
};
