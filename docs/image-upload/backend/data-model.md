# Image upload API — data model

PostgreSQL database `image_upload` through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`, applied on start).

## `images`

- `id`, `user_id`, `original_name`, `mime_type`, `size`, `stored_name` (S3 key, unique), `status` (`active` | `scheduled`), `scheduled_at`, `deleted_at` (set while in the bin), `created_at`, `updated_at`
- Indexes: `(user_id, created_at)`, `deleted_at`
- `purgeAt` in replies is computed (`deleted_at` + `BIN_RETENTION_DAYS`), not stored.

## Elsewhere

- S3 bucket `image-uploads` holds the bytes.
- Redis holds the BullMQ queues `publish-image` (one delayed job per scheduled image, job id = image id) and `purge-bin` (repeating).

Change the schema, then `pnpm --filter @chat/image-upload-backend db:migrate`.
