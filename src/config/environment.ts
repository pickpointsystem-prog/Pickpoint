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
  const env = (import.meta as any).env?.VITE_APP_ENV as Environment;
  return env || 'development';
};

const config: EnvironmentConfig = {
  env: getEnvironment(),
  publicDomain: (import.meta as any).env?.VITE_PUBLIC_DOMAIN || 'pickpoint.my.id',
  adminDomain: (import.meta as any).env?.VITE_ADMIN_DOMAIN || 'admin.pickpoint.my.id',
  qaDomain: (import.meta as any).env?.VITE_QA_DOMAIN || 'qa.pickpoint.my.id',
  demoDomain: (import.meta as any).env?.VITE_DEMO_DOMAIN || 'demo.pickpoint.my.id',
  apiUrl: (import.meta as any).env?.VITE_API_URL || '/api',
  whatsappToken: (import.meta as any).env?.VITE_WHATSAPP_TOKEN || '',
  whatsappApiUrl: (import.meta as any).env?.VITE_WHATSAPP_API_URL || '/api/wa-proxy',
  enableAnalytics: ((import.meta as any).env?.VITE_ENABLE_ANALYTICS === 'true'),
  enableNotifications: ((import.meta as any).env?.VITE_ENABLE_NOTIFICATIONS === 'true'),
  enableDebugMode: ((import.meta as any).env?.VITE_ENABLE_DEBUG_MODE === 'true'),
  storagePrefix: (import.meta as any).env?.VITE_STORAGE_PREFIX || 'pickpoint_'
  ,
  sessionTimeout: parseInt((import.meta as any).env?.VITE_SESSION_TIMEOUT || '3600000'),
  maxLoginAttempts: parseInt((import.meta as any).env?.VITE_MAX_LOGIN_ATTEMPTS || '5'),
};

export const logConfig = (): void => {
  if (config.enableDebugMode) {
    console.log('🔧 Environment Config:', {
      environment: config.env,
      publicDomain: config.publicDomain,
      adminDomain: config.adminDomain,
      features: {
        analytics: config.enableAnalytics,
        notifications: config.enableNotifications,
        debug: config.enableDebugMode,
      }
    });
  }
};

export default config;