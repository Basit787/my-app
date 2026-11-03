import { localAppOrigins } from "backend-common";
import { PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.chatbot.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/chatbot",
  vectorDatabaseUrl: process.env.VECTOR_DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/chatbot_vectors",
  corsOrigin:
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? localAppOrigins(),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  s3: {
    endpoint: process.env.S3_ENDPOINT?.trim() || "",
    region: process.env.S3_REGION || "us-east-1",
    accessKey: process.env.S3_ACCESS_KEY_ID || "test",
    secretKey: process.env.S3_SECRET_ACCESS_KEY || "test",
    bucket: process.env.S3_BUCKET || "chatbot",
  },
  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen2.5:0.5b",
    embedModel: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
  },
  searxngUrl: process.env.SEARXNG_URL || "http://localhost:8080",
}));

export type AppConfig = ConfigType<typeof appConfig>;
