# Link shortener API — data model

PostgreSQL database `link_shortener` through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`, applied on start).

## `links`

- `id` (uuid), `slug` (unique), `url`, `title`, `user_id` (auth user id, indexed), `click_count`, `expires_at`, `created_at`, `updated_at`

## `clicks`

- `id`, `link_id` (→ `links`, deleted with the link), `referrer`, `user_agent`, `created_at` — one row per redirect, indexed by `(link_id, created_at)` for the 30-day stats

## Seed

`prisma/seed.mjs` logs in as the demo users on the auth service and gives each a few links (slugs prefixed with the username) with clicks; it runs on every dev start and is skipped until those users are registered.

Change the schema, then `pnpm --filter @chat/link-shortener-backend db:migrate`.
