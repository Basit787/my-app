import { localAppOrigins, PORTS } from "ports";
import { registerAs, type ConfigType } from "@nestjs/config";

// Read once at startup; inject with @Inject(appConfig.KEY) for a typed AppConfig
export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT) || PORTS.linkShortener.backend,
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/link_shortener",
  corsOrigin:
    process.env.CORS_ORIGIN?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? localAppOrigins(),
}));

export type AppConfig = ConfigType<typeof appConfig>;
