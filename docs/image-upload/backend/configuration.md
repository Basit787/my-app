# Image upload API — configuration

Read by `libs/common/src/config/app.config.ts` (and `JWT_SECRET` by `backend-common`).

- `PORT` — default `3006`; `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/image_upload`
- `JWT_SECRET` — verifies access tokens (same value as the auth service)
- `CORS_ORIGIN` — comma-separated allowed origins, default every web app on `localhost`
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` (`image-uploads`), `S3_REGION`
- `MAX_FILE_SIZE_MB` — default `10`
- `REDIS_URL` — default `redis://127.0.0.1:6379`
- `BIN_RETENTION_DAYS` — default `30`; `BIN_PURGE_CRON` — default `0 * * * *` (hourly)
- `AUTH_URL` — only for `prisma db seed`, which logs in as the demo users
