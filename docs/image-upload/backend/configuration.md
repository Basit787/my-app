# Image upload API — configuration

Read by `src/config/env.ts`.

- `PORT` — default `3006`; `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/image_upload`
- `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE` — access-token verification
- `CORS_ORIGIN` — comma-separated allowed origins
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` (`image-uploads`), `MINIO_REGION`
- `MAX_FILE_SIZE_MB` — default `10`
- `REDIS_URL` — default `redis://127.0.0.1:6379`
- `BIN_RETENTION_DAYS` — default `30`; `BIN_PURGE_CRON` — default `0 * * * *` (hourly)
