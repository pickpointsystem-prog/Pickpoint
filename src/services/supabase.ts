import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ActivityLog, AppSettings, Customer, Location, Package, User } from '../types';

interface SupabasePayload {
  users: User[];
  locations: Location[];
  packages: Package[];
  customers: Customer[];
  activities: ActivityLog[];
  settings?: AppSettings;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const SupabaseService = {
  isReady: () => !!client,
  upsertTable: async <T>(table: string, payload: T[]): Promise<void> => {
    if (!client) return;
    await client.from(table).upsert(payload);
  },
  fetchAllData: async (): Promise<SupabasePayload | null> => {
    if (!client) return null;
    const [users, locations, packages, customers, activities, settings] = await Promise.all([
      client.from('users').select('*'),
      client.from('locations').select('*'),
      client.from('packages').select('*'),
      client.from('customers').select('*'),
      client.from('activities').select('*'),
      client.from('settings').select('*').single()
    ]);
    return {
      users: users.data || [],
      locations: locations.data || [],
      packages: packages.data || [],
      customers: customers.data || [],
      activities: activities.data || [],
      settings: settings.data || undefined
    };
  },
  insertActivity: async (activity: ActivityLog): Promise<void> => {
    if (!client) return;
    await client.from('activities').insert(activity);
  }
};
