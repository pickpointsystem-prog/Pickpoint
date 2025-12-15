type AppEnv = "development" | "qa" | "demo" | "production";

type ImportMetaWithEnv = ImportMeta & {
  env: Record<string, string | undefined>;
};

const resolveMetaEnv = (): Record<string, string | undefined> | undefined => {
  if (typeof import.meta === "object" && import.meta && "env" in import.meta) {
    return (import.meta as ImportMetaWithEnv).env;
  }
  return undefined;
};

const metaEnv = resolveMetaEnv();

const normalizeEnv = (value?: string): AppEnv => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "qa" || normalized === "demo" || normalized === "production") {
    return normalized;
  }
  return "development";
};

const inferredMode = (metaEnv?.VITE_APP_ENV as string | undefined) ?? (metaEnv?.MODE as string | undefined);
const env: AppEnv = normalizeEnv(inferredMode);

const defaultPublicDomains: Record<AppEnv, string> = {
  production: "pickpoint.my.id",
  qa: "qa.pickpoint.my.id",
  demo: "demo.pickpoint.my.id",
  development: "pickpoint.my.id"
};

const defaultDashboardDomains: Record<AppEnv, string> = {
  production: "admin.pickpoint.my.id",
  qa: "qa.pickpoint.my.id",
  demo: "admin.pickpoint.my.id",
  development: "admin.pickpoint.my.id"
};

const defaultApiUrls: Record<AppEnv, string> = {
  production: "https://api.pickpoint.my.id",
  qa: "https://api-qa.pickpoint.my.id",
  demo: "https://api-demo.pickpoint.my.id",
  development: "http://localhost:3000"
};

const publicDomain = (metaEnv?.VITE_PUBLIC_DOMAIN as string | undefined) || defaultPublicDomains[env];
const dashboardDomain = (metaEnv?.VITE_DASHBOARD_DOMAIN as string | undefined) || defaultDashboardDomains[env];
const apiUrl = (metaEnv?.VITE_API_URL as string | undefined) || defaultApiUrls[env];

const config = {
  storagePrefix: "pp_",
  enableDebugMode: env !== "production",
  env,
  apiUrl,
  whatsappApiUrl: (metaEnv?.VITE_WA_API_URL as string | undefined) || "/api/wa",
  publicDomain,
  dashboardDomain,
  domains: {
    landing: {
      production: "pickpoint.my.id",
      qa: "qa.pickpoint.my.id",
      demo: "demo.pickpoint.my.id",
      development: publicDomain
    },
    dashboard: {
      production: "admin.pickpoint.my.id",
      qa: "qa.pickpoint.my.id",
      demo: "admin.pickpoint.my.id",
      development: dashboardDomain
    }
  }
};

export const logConfig = () => {
  console.log("Config loaded:", config);
};

export default config;
