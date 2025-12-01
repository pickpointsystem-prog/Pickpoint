// Backend temporarily disabled: provide a safe no-op SupabaseService
// so the app can run without a configured backend while we rebuild it cleanly.
import { ActivityLog, AppSettings, Customer, Location, Package, User } from '../types';

interface SupabasePayload {
  users: User[];
  locations: Location[];
  packages: Package[];
  customers: Customer[];
  activities: ActivityLog[];
  settings?: AppSettings;
}

export const SupabaseService = {
  isReady: () => false,
  upsertTable: async <T>(_table: string, _payload: T[]): Promise<void> => {
    // no-op
    return;
  },
  fetchAllData: async (): Promise<SupabasePayload | null> => {
    return null; // backend disabled
  },
  insertActivity: async (_activity: ActivityLog): Promise<void> => {
    // no-op
    return;
  }
};
