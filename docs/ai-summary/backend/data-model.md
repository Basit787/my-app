# AI summary API — data model

PostgreSQL database `ai_summary` through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`, applied on start).

## `documents`

- `id` (uuid), `user_id` (indexed), `filename`, `storage_key` (S3 key, unique), `size`, `status` (`UPLOADED` → `PROCESSING` → `COMPLETED` | `FAILED`), `summary`, `created_at`, `updated_at`

## Elsewhere

- S3 bucket `ai-summaries`: the uploaded text at `<userId>/<uuid>.txt`.
- Redis channel `ai-summary:events:<userId>`: status events for the user's open streams.

## Seed

`prisma/seed.mjs` gives each demo user finished documents with ready-made summaries, so seeding needs no model calls.

Change the schema, then `pnpm --filter @chat/ai-summary-backend db:migrate`.
