/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_WHATSAPP_TOKEN: string;
  readonly VITE_WHATSAPP_API_URL: string;
  readonly VITE_PUBLIC_DOMAIN: string;
  readonly VITE_ADMIN_DOMAIN: string;
  readonly VITE_QA_DOMAIN: string;
  readonly VITE_DEMO_DOMAIN: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_MAX_LOGIN_ATTEMPTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
