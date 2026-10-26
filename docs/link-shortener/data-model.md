# Link shortener — data model

PostgreSQL database `link_shortener`, schema in `src/db/schema/`, migrations in `src/drizzle/` (applied at startup by `instrumentation.ts`).

## `links`

- `id` (uuid), `slug` (unique), `url`, `title`, `user_id` (auth user id, indexed), `click_count`, `expires_at`, `created_at`, `updated_at`

## `clicks`

- `id`, `link_id` (→ `links`), `referrer`, `user_agent`, `created_at` — one row per redirect, used for the 30-day stats

Change the schema, then `pnpm --filter @chat/link-shortener db:generate`.
