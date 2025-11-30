import { ActivityLog, AppSettings, Customer, Location, Package, User } from '../types';

interface SupabasePayload {
  users: User[];
  locations: Location[];
  packages: Package[];
  customers: Customer[];
  activities: ActivityLog[];
  settings?: AppSettings;
}

// Dummy SupabaseService keeps API surface while running entirely local
export const SupabaseService = {
  isReady: () => false,
  upsertTable: async <T>(_table: string, _payload: T): Promise<void> => {
    return Promise.resolve();
  },
  fetchAllData: async (): Promise<SupabasePayload | null> => {
    return Promise.resolve(null);
  },
  insertActivity: async (_activity: ActivityLog): Promise<void> => {
    return Promise.resolve();
  }
};
