import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config/environment';
import { ActivityLog } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const client: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const SupabaseService = {
  isReady: () => Boolean(client),

  async fetchAllData() {
    if (!client) return null;
    try {
      const [users, locations, packages, customers, activities, settings] = await Promise.all([
        client.from('users').select('*'),
        client.from('locations').select('*'),
        client.from('packages').select('*'),
        client.from('customers').select('*'),
        client.from('activities').select('*'),
        client.from('settings').select('*').limit(1)
      ]);

      const payloads = {
        users: users.data ?? [],
        locations: locations.data ?? [],
        packages: packages.data ?? [],
        customers: customers.data ?? [],
        activities: activities.data ?? [],
        settings: settings.data && settings.data.length ? settings.data[0] : null
      };

      return payloads;
    } catch (error) {
      if (config.enableDebugMode) console.warn('Supabase fetch failed', error);
      return null;
    }
  },

  async upsertTable<T>(table: string, payload: T[]) {
    if (!client || payload.length === 0) return;
    try {
      await client.from(table).upsert(payload, { onConflict: 'id' });
    } catch (error) {
      if (config.enableDebugMode) console.warn(`Supabase upsert failed for ${table}`, error);
    }
  },

  async insertActivity(activity: ActivityLog) {
    if (!client) return;
    try {
      await client.from('activities').insert([activity]);
    } catch (error) {
      if (config.enableDebugMode) console.warn('Supabase activity insert failed', error);
    }
  }
};
