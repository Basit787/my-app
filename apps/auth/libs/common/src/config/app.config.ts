import { localAppOrigins } from "backend-common";
import { PORTS } from "ports";
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
  s3: {
    endpoint: process.env.S3_ENDPOINT?.trim() || "",
    accessKey: process.env.S3_ACCESS_KEY_ID || "test",
    secretKey: process.env.S3_SECRET_ACCESS_KEY || "test",
    bucket: process.env.S3_BUCKET || "auth",
    region: process.env.S3_REGION || "us-east-1",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
