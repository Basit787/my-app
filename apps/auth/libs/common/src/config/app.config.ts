import { localAppOrigins, PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

const list = (value: string | undefined, fallback: string[]) =>
  value
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean) ?? fallback;

const allowLanOrigins = process.env.ALLOW_LAN_ORIGINS
  ? process.env.ALLOW_LAN_ORIGINS === "true"
  : process.env.NODE_ENV !== "production";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.auth.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/auth",
  // How long a sign-in lasts; tokens are signed with JWT_SECRET (backend-common/src/auth.ts)
  tokenTtlSeconds: Number(process.env.JWT_TTL_SECONDS) || 24 * 60 * 60,
  corsOrigin: list(process.env.CORS_ORIGIN, localAppOrigins()),
  allowLanOrigins,
  // Sent as the Origin by the mobile app, since native requests have none
  mobileAppOrigin: process.env.MOBILE_APP_ORIGIN || "chatwave://",
  // Profile photos
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() || "http://localhost:9000",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "auth",
    region: process.env.MINIO_REGION || "us-east-1",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
