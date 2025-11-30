// Dummy SupabaseService for compatibility
export const SupabaseService = {
  isReady: () => false, // Add missing method
  get: () => null,
  set: () => null,
  insertActivity: () => Promise.resolve(), // Add missing method
};
