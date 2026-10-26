import { localAppOrigins, LOCALHOST, PORTS, serviceUrl } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.chatApp.backend,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/realtime_chat",
  // The auth service, where `pnpm db:seed` logs the demo users in
  authUrl: process.env.AUTH_URL || serviceUrl("auth", "backend", { hostname: LOCALHOST }),
  corsOrigin: process.env.CORS_ORIGIN?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? [...localAppOrigins(), "http://localhost:80"],
  allowLanOrigins: process.env.ALLOW_LAN_ORIGINS
    ? process.env.ALLOW_LAN_ORIGINS === "true"
    : process.env.NODE_ENV !== "production",
  // The mobile app sends this as its Origin, since native requests have none
  mobileAppOrigin: process.env.MOBILE_APP_ORIGIN || "chatwave://",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 25,
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() || "http://localhost:9000",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "chat-uploads",
    region: process.env.MINIO_REGION || "us-east-1",
  },
  turn: {
    host: process.env.TURN_HOST || "localhost",
    port: Number(process.env.TURN_PORT) || 3478,
    user: process.env.TURN_USER || "chat",
    password: process.env.TURN_PASSWORD || "chatpass",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
