# Link shortener — configuration

- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/link_shortener`; `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` configure the shared PostgreSQL container
- `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE` — access-token verification (`src/server/env.ts`)
- `AUTH_PROXY_TARGET` — where `next.config.ts` rewrites `/auth-api/*`
- Port `3004` (package scripts and `packages/ports`).
