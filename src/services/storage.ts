
import { User, Location, Package, Customer, AppSettings } from '../types';
import { INITIAL_USERS, INITIAL_LOCATIONS, INITIAL_SETTINGS, SEED_KEYS, INITIAL_CUSTOMERS } from '../constants';

// Helper to get from storage safely
function get<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

// Helper to set storage
function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const StorageService = {
  init: () => {
    if (!localStorage.getItem(SEED_KEYS.USERS)) set(SEED_KEYS.USERS, INITIAL_USERS);
    if (!localStorage.getItem(SEED_KEYS.LOCATIONS)) set(SEED_KEYS.LOCATIONS, INITIAL_LOCATIONS);
    if (!localStorage.getItem(SEED_KEYS.SETTINGS)) set(SEED_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!localStorage.getItem(SEED_KEYS.CUSTOMERS)) set(SEED_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    // Packages start empty if not present, but we ensure the array exists
    if (!localStorage.getItem(SEED_KEYS.PACKAGES)) set(SEED_KEYS.PACKAGES, []);
  },

  // Users
  getUsers: (): User[] => get(SEED_KEYS.USERS, []),
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
};
