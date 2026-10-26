# Image upload API — architecture

Hono API on port `3006` with Prisma (PostgreSQL), MinIO for the bytes and BullMQ (Redis) for scheduled work.

## Layout

- `src/app.ts` — Hono app: secure headers, CORS, `/health`, `/images` routes, JSON 404 and `errorHandler` (`{ error }`).
- `src/routes/image.routes.ts` → `src/controllers/image.controller.ts` (validation with zod, auth with `requireAuth`) → `src/models/image.model.ts` (Prisma queries) → `src/views/image.view.ts` (DTOs).
- `src/middleware/` — `require-auth.ts` (bearer token via `lib/auth/access-token-verifier.ts` from `backend-common/auth`), `zod-validator.ts`, `error-handler.ts`.
- `src/queues/` + `src/jobs/` — `publish-image` (delayed job per scheduled upload) and `purge-bin` (repeating, `BIN_PURGE_CRON`, deletes images binned more than `BIN_RETENTION_DAYS` ago), built with `createJobQueue` from `backend-common`.
- `src/prisma/` — schema and migrations (applied on start); client generated to `src/generated`.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)

## Infrastructure

- Owns the Redis container (`6379`) in its compose files; uses PostgreSQL (link-shortener) and MinIO (chat-app-backend).
