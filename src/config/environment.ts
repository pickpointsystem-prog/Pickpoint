/**
 * Environment Configuration
 * Centralized configuration for multi-environment setup
 * 
 * Environments:
 * - production: pickpoint.my.id (LIVE public) + admin.pickpoint.my.id (LIVE admin)
 * - qa: qa.pickpoint.my.id (Pre-production testing)
 * - demo: demo.pickpoint.my.id (Client demonstrations)
 * - development: localhost (Local development)
 */

export type Environment = 'production' | 'qa' | 'demo' | 'development';

interface EnvironmentConfig {
  env: Environment;
  publicDomain: string;
  adminDomain: string;
  qaDomain: string;
  demoDomain: string;
  apiUrl: string;
  whatsappToken: string;
  whatsappApiUrl: string;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableDebugMode: boolean;
  storagePrefix: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

const getEnvironment = (): Environment => {
  const env = import.meta.env.VITE_APP_ENV as Environment;
  return env || 'development';
};

const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

const isAdminDomain = (): boolean => {
  const domain = getCurrentDomain();
  return domain.startsWith('admin.') || domain.includes('localhost');
};

const config: EnvironmentConfig = {
  env: getEnvironment(),
  
  // Domain Configuration
  publicDomain: import.meta.env.VITE_PUBLIC_DOMAIN || 'pickpoint.my.id',
  adminDomain: import.meta.env.VITE_ADMIN_DOMAIN || 'admin.pickpoint.my.id',
  qaDomain: import.meta.env.VITE_QA_DOMAIN || 'qa.pickpoint.my.id',
  demoDomain: import.meta.env.VITE_DEMO_DOMAIN || 'demo.pickpoint.my.id',
  
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  whatsappToken: import.meta.env.VITE_WHATSAPP_TOKEN || '',
  whatsappApiUrl: import.meta.env.VITE_WHATSAPP_API_URL || 'https://api.whatsapp.com/send',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // Storage Configuration
  storagePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'pickpoint_',
  
  // Security Configuration
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
};

// Environment-specific URLs
export const getPublicUrl = (): string => {
  const { env, publicDomain } = config;
  
  if (env === 'development') return `http://${publicDomain}`;
  if (env === 'qa') return `https://${config.qaDomain}`;
  if (env === 'demo') return `https://${config.demoDomain}`;
  return `https://${publicDomain}`;
};

export const getAdminUrl = (): string => {
  const { env, adminDomain } = config;
  
  if (env === 'development') return `http://${adminDomain}`;
  if (env === 'qa') return `https://${config.qaDomain}/admin`;
  if (env === 'demo') return `https://${config.demoDomain}/admin`;
  return `https://${adminDomain}`;
};

// Environment checks
export const isDevelopment = (): boolean => config.env === 'development';
export const isProduction = (): boolean => config.env === 'production';
export const isQA = (): boolean => config.env === 'qa';
export const isDemo = (): boolean => config.env === 'demo';

// Debug helper
export const logConfig = (): void => {
  if (config.enableDebugMode) {
    console.log('🔧 Environment Config:', {
      environment: config.env,
      currentDomain: getCurrentDomain(),
      isAdmin: isAdminDomain(),
      publicUrl: getPublicUrl(),
      adminUrl: getAdminUrl(),
      features: {
        analytics: config.enableAnalytics,
        notifications: config.enableNotifications,
        debug: config.enableDebugMode,
      }
    });
  }
};

export default config;
