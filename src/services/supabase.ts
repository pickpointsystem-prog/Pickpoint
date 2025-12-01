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

// Transform helpers for camelCase <-> snake_case
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const transformKeysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = toSnakeCase(key);
      acc[snakeKey] = transformKeysToSnake(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

const transformKeysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamel);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key);
      acc[camelKey] = transformKeysToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

export const SupabaseService = {
  isReady: () => !!client,

  upsertTable: async <T extends Record<string, any>>(
    table: string,
    payload: T[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!client) return { success: false, error: 'Client not initialized' };
    try {
      const snakePayload = transformKeysToSnake(payload);
      const { error } = await client.from(table).upsert(snakePayload, { onConflict: 'id' });
      if (error) {
        console.error(`[Supabase] Upsert ${table} error:`, error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.error(`[Supabase] Upsert ${table} exception:`, e);
      return { success: false, error: e.message };
    }
  },

  fetchAllData: async (): Promise<SupabasePayload | null> => {
    if (!client) return null;
    try {
      const [users, locations, packages, customers, activities, settings] = await Promise.all([
        client.from('users').select('*'),
        client.from('locations').select('*'),
        client.from('packages').select('*'),
        client.from('customers').select('*'),
        client.from('activities').select('*').order('timestamp', { ascending: false }).limit(1000),
        client.from('settings').select('*').limit(1).single()
      ]);

      return {
        users: transformKeysToCamel(users.data || []),
        locations: transformKeysToCamel(locations.data || []),
        packages: transformKeysToCamel(packages.data || []),
        customers: transformKeysToCamel(customers.data || []),
        activities: transformKeysToCamel(activities.data || []),
        settings: transformKeysToCamel(settings.data || undefined)
      };
    } catch (e) {
      console.error('[Supabase] Fetch all data error:', e);
      return null;
    }
  },

  insertActivity: async (activity: ActivityLog): Promise<{ success: boolean; error?: string }> => {
    if (!client) return { success: false, error: 'Client not initialized' };
    try {
      const snakeActivity = transformKeysToSnake(activity);
      const { error } = await client.from('activities').insert(snakeActivity);
      if (error) {
        console.error('[Supabase] Insert activity error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.error('[Supabase] Insert activity exception:', e);
      return { success: false, error: e.message };
    }
  }
};
