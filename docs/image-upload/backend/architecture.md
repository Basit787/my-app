# Image upload API — architecture

NestJS 12 service on port `3006` (Swagger at `/docs`) with Prisma (PostgreSQL), S3 for the bytes and BullMQ (Redis) for scheduled work.

## Layout

- `src/images/` — `ImagesController` (`/images`), `ImagesService` (list, counts, upload, file stream, bin, restore, purge), DTOs, `utils/` (`toImageDto`, `addDays`).
- `src/images/queues/` — two BullMQ queues built with `createJobQueue` from `backend-common`, started with the module:
  - `PublishImageQueue` — one delayed job per scheduled upload (job id = image id); at `scheduledAt` the image turns `active`.
  - `PurgeBinQueue` — repeating job on `BIN_PURGE_CRON` that deletes images binned more than `BIN_RETENTION_DAYS` ago from S3, then their rows.
- `ImagesModule` registers multer through `createUploadOptions` (images only, up to `MAX_FILE_SIZE_MB`).
- `libs/common` (`@app/common`) — `appConfig` and re-exports from `backend-common`; `libs/db` (`@app/db`) — `PrismaService`, `ImageRepository`; `libs/storage` (`@app/storage`) — the shared S3 module on bucket `image-uploads`.
- `prisma/` — schema, migrations (applied on start), `seed.mjs` with images from `prisma/seed-assets/`.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
