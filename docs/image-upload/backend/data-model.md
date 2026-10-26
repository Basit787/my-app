# Image upload API — data model

PostgreSQL database `image_upload` through Prisma (`src/prisma/schema.prisma`, migrations in `src/prisma/migrations/`, applied on start).

## `images`

- `id`, `user_id`, `original_name`, `mime_type`, `size`, `stored_name` (MinIO key, unique), `status` (`active` | `scheduled`), `scheduled_at`, `deleted_at` (set while in the bin), `created_at`, `updated_at`
- Indexes: `(user_id, created_at)`, `deleted_at`

## Elsewhere

- MinIO bucket `image-uploads` holds the bytes.
- Redis holds the BullMQ queues `publish-image` (one delayed job per scheduled image, job id = image id) and `purge-bin` (repeating).
