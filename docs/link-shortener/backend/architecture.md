# Link shortener API — architecture

NestJS 12 service on port `3012` (Swagger at `/docs`): short links with optional custom slug and expiry, a public redirect and per-day click stats. PostgreSQL through Prisma.

## Layout

- `src/links/` — `LinksController` (`/links`, the owner's links and stats), `ShortLinksController` (public `GET /r/:slug` redirect), `LinksService` (unique slugs, expiry, click recording, 30-day stats), DTOs, `utils/` (`randomSlug`, `SLUG_PATTERN`, `lastDays`, `toLinkDto`).
- `libs/common` (`@app/common`) — `appConfig` and re-exports from `backend-common`.
- `libs/db` (`@app/db`) — `PrismaService`, `LinkRepository`; schema, migrations and `seed.mjs` in `prisma/`.

## Short links on the app's own origin

- The redirect lives on the backend, but the frontend's Vite config proxies `/r/*` to it (`passthrough: ["/r"]`), so a short link is `http://<frontend host>:3004/r/<slug>` and works from any device that can open the app.
- `shortPath` in every reply (`/r/<slug>`) is joined with the page's origin by the frontend.

## Rules

- Every `/links` query is scoped to the token's user id; another user's link is a 404.
- Slugs are global: a requested slug that exists is `409`; without one, a random free slug is generated.
- An expired link redirects nowhere (`404`) but stays in the owner's list.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
