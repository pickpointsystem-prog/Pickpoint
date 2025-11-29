import { User, Location, Package, Customer, AppSettings, ActivityLog } from '../types';
import { INITIAL_USERS, INITIAL_LOCATIONS, INITIAL_SETTINGS, SEED_KEYS, INITIAL_CUSTOMERS } from '../constants';
import config from '../config/environment';

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
  },
  deleteUser: (id: string) => {
    const users = get<User[]>(SEED_KEYS.USERS, []);
    set(SEED_KEYS.USERS, users.filter(u => u.id !== id));
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
  },
  deleteLocation: (id: string) => {
    const locs = get<Location[]>(SEED_KEYS.LOCATIONS, []);
    set(SEED_KEYS.LOCATIONS, locs.filter(l => l.id !== id));
  },

  // Packages
  getPackages: (): Package[] => get(SEED_KEYS.PACKAGES, []),
  savePackage: (pkg: Package) => {
    const pkgs = get<Package[]>(SEED_KEYS.PACKAGES, []);
    const idx = pkgs.findIndex(p => p.id === pkg.id);
    if (idx >= 0) pkgs[idx] = pkg;
    else pkgs.push(pkg);
    set(SEED_KEYS.PACKAGES, pkgs);
  },

  // Customers
  getCustomers: (): Customer[] => get(SEED_KEYS.CUSTOMERS, []),
  saveCustomer: (cust: Customer) => {
    const custs = get<Customer[]>(SEED_KEYS.CUSTOMERS, []);
    const idx = custs.findIndex(c => c.id === cust.id);
    if (idx >= 0) custs[idx] = cust;
    else custs.push(cust);
    set(SEED_KEYS.CUSTOMERS, custs);
  },
  deleteCustomer: (id: string) => {
    const custs = get<Customer[]>(SEED_KEYS.CUSTOMERS, []);
    set(SEED_KEYS.CUSTOMERS, custs.filter(c => c.id !== id));
  },

  // Settings with Self-Healing/Migration for new keys
  getSettings: (): AppSettings => {
    const saved = get<AppSettings>(SEED_KEYS.SETTINGS, INITIAL_SETTINGS);
    // Merge with INITIAL_SETTINGS to ensure new keys (like templates) exist if user has old data
    return { ...INITIAL_SETTINGS, ...saved };
  },
  saveSettings: (s: AppSettings) => set(SEED_KEYS.SETTINGS, s),

  // Activities
  getActivities: (): ActivityLog[] => get(SEED_KEYS.ACTIVITIES, []),
  addActivity: (activity: ActivityLog) => {
    const logs = get<ActivityLog[]>(SEED_KEYS.ACTIVITIES, []);
    logs.unshift(activity); // Add to top
    // Keep only last 1000 activities
    if (logs.length > 1000) logs.length = 1000;
    set(SEED_KEYS.ACTIVITIES, logs);
  },
};
