import { localAppOrigins, PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.aiSummary.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/ai_summary",
  corsOrigin:
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? localAppOrigins(),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 1,
  // Pub/sub between summary jobs and each user's open event streams
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT?.trim() || "http://localhost:9000",
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "ai-summaries",
    region: process.env.MINIO_REGION || "us-east-1",
  },
  // Local model served by Ollama through its OpenAI-compatible API
  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen2.5:0.5b",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
