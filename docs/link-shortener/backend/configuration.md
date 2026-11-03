# Link shortener API — configuration

Read by `libs/common/src/config/app.config.ts` (and `JWT_SECRET` by `backend-common`).

- `PORT` — default `3012`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/link_shortener`
- `JWT_SECRET` — verifies access tokens (same value as the auth service)
- `CORS_ORIGIN` — comma-separated allowed origins, default every web app on `localhost`
- `AUTH_URL` — only for `prisma db seed`, which logs in as the demo users (default `http://localhost:3001`)
