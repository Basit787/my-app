# Auth service — configuration

Read by `libs/common/src/config/app.config.ts`.

- `PORT` — default `3001`; `MONGODB_URI`
- `BETTER_AUTH_SECRET` — session signing secret (set a real one outside dev)
- `AUTH_PUBLIC_URL` — public URL of this service: JWT issuer and avatar links (must be reachable from browsers)
- `AUTH_AUDIENCE` — access-token audience (default `chatwave`); `ACCESS_TOKEN_TTL` — default 15 minutes
- `REFRESH_TOKEN_TTL_DAYS`, `REFRESH_COOKIE_NAME`, `REFRESH_COOKIE_PATH`, `COOKIE_SECURE` — refresh-token cookie
- `CORS_ORIGIN`, `ALLOW_LAN_ORIGINS`, `MOBILE_APP_ORIGIN` — trusted origins
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — seeded admin (default `admin@chat.local` / `Admin123!`)
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_REGION` — avatar storage
