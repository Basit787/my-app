import { readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

// The seed command lives in package.json "prisma.seed"; Prisma 7 reads it only from this config, so it is passed on
const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  prisma: { seed: string };
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: packageJson.prisma.seed },
  datasource: { url: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/chatbot" },
});
