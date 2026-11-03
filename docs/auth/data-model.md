# Auth service — data model

PostgreSQL database `auth` through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`, applied on start by `prisma migrate deploy`).

## `users`

- `id` (uuid), `name` (unique, the username every app shows), `email` (unique, stored lower-case), `password_hash` (`scrypt:<salt>:<hash>`), `role` (`user` | `admin`, default `user`), `avatar_key` (S3 key or null), `created_at`, `updated_at`

## Elsewhere

- S3 bucket `auth`: profile photos at `avatars/<userId>.<ext>`.
- Other apps store only the user id (`sub` of the token) as the owner of their rows; nothing else is shared.

Change the schema, then `pnpm --filter @chat/auth db:migrate`.
