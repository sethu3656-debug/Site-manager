import "dotenv/config";

function required(name: string, fallback = ""): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || fallback;
}

export const env = {
  appId: required("APP_ID", "sitemanager-local-app"),
  appSecret: required("APP_SECRET", "local-development-secret-key-for-sitemanager-app-12345"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL", "mysql://root:root@localhost:3306/sitemanager"),
  kimiAuthUrl: required("KIMI_AUTH_URL", "http://localhost:3000/oauth"),
  kimiOpenUrl: required("KIMI_OPEN_URL", "http://localhost:3000/open"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
