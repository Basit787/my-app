import { localAppOrigins } from "backend-common";
import { PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.invoices.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/invoices",
  corsOrigin:
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? localAppOrigins(),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 20,
  // Pub/sub between extraction jobs and each user's open event streams
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  s3: {
    endpoint: process.env.S3_ENDPOINT?.trim() || "",
    accessKey: process.env.S3_ACCESS_KEY_ID || "test",
    secretKey: process.env.S3_SECRET_ACCESS_KEY || "test",
    bucket: process.env.S3_BUCKET || "invoices",
    region: process.env.S3_REGION || "us-east-1",
  },
  // Tesseract languages (installed tessdata), e.g. "eng+deu"; pages past maxPages are skipped
  ocr: {
    languages: process.env.OCR_LANGUAGES || "eng",
    maxPages: Number(process.env.OCR_MAX_PAGES) || 30,
  },
  // Local model served by Ollama through its OpenAI-compatible API
  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen2.5:0.5b",
  },
}));

export type AppConfig = ConfigType<typeof appConfig>;
