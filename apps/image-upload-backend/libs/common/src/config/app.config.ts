import { localAppOrigins, PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.imageUpload.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/image_upload",
  corsOrigin:
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? localAppOrigins(),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  // Binned images are purged from the bucket after this many days, checked on this cron pattern
  binRetentionDays: Number(process.env.BIN_RETENTION_DAYS) || 30,
  binPurgeCron: process.env.BIN_PURGE_CRON || "0 * * * *",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() || "http://localhost:9000",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "image-uploads",
    region: process.env.MINIO_REGION || "us-east-1",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
