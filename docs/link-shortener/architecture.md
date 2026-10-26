# Link shortener — architecture

One Next.js 16 app (App Router, Turbopack, `cacheComponents`) on port `3004`: the UI and the route-handler API live together. PostgreSQL through Drizzle.

## Layout (one export per file)

- `src/app/` — pages (`(dashboard)/page.tsx`, `login/page.tsx`), route handlers (`api/links`, `api/links/[id]`, `api/links/[id]/stats`, `api/health`) and the public redirect `r/[slug]`.
- `src/db/` — pg pool + Drizzle client, `schema/links.ts`, `schema/clicks.ts`, `link-repository.ts`, `migrate.ts`; SQL migrations in `src/drizzle/`.
- `src/server/` — `env.ts`, `link-service.ts` (business rules), `auth/` (`access-token-verifier.ts` = `createAccessTokenVerifier` from `backend-common/auth`, `require-user.ts`), `http/` (`ApiError`, `handle`, `parseBody`, `errorResponse`), `utils/`.
- `src/components/`, `src/lib/` (auth and API clients from `frontend-common`), `src/types/`, `src/validation/` (zod), `src/utils/`.
- `src/proxy.ts` — redirects page requests without the better-auth session cookie to `/login?next=…`.
- `src/instrumentation.ts` — applies pending Drizzle migrations when the server starts.

## Data

- `links` (slug, URL, title, owner, click count, expiry) and `clicks` (one row per visit with referrer and user agent) in the `link_shortener` database; every query is scoped to the token's user id.
- The PostgreSQL container (`5433`) is defined in this app's compose files and reused by other apps.

## Auth

- `/auth-api/*` is rewritten to the auth service (first-party cookie). Pages are gated by `proxy.ts` and `RequireAuth`; route handlers require a bearer access token.
