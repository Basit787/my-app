# Auth service — configuration

Read by `libs/common/src/config/app.config.ts` (and `JWT_SECRET` by `backend-common`).

- `PORT` — default `3001`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/auth`
- `JWT_SECRET` — signs the tokens; every backend needs the same value (dev default `dev-secret-change-me`, required in production)
- `JWT_TTL_SECONDS` — how long a sign-in lasts, default `86400` (24 h)
- `CORS_ORIGIN` — comma-separated allowed origins, default every web app on `localhost` (`localAppOrigins()`)
- `ALLOW_LAN_ORIGINS` — also allow private-network origins (phones on the same Wi-Fi); default on outside production
- `MOBILE_APP_ORIGIN` — origin sent by a native client, default `chatwave://`
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` (default `auth`), `S3_REGION` — profile photos
