# Link shortener — API

Route handlers in `src/app/api/` (same origin as the UI). Every `/api/links*` route needs `Authorization: Bearer <accessToken>` and only sees the caller's links. Errors are `{ error, details? }`.

- `GET /api/links` → `{ links: Link[] }` (newest first)
- `POST /api/links` `{ url, slug?, title?, expiresAt? }` → `201 Link` (a random slug when none is given; 409 when the slug is taken)
- `GET /api/links/:id` → `Link`; `PATCH /api/links/:id` `{ url?, slug?, title?, expiresAt? }` → `Link`; `DELETE /api/links/:id` → `{ ok: true }`
- `GET /api/links/:id/stats` → `{ linkId, totalClicks, days: { day, count }[] }` (last 30 days)
- `GET /api/health` → `{ ok: true }`
- Public `GET /r/:slug` → `302` to the target URL and one click recorded; `404` when missing or expired

`Link`: `{ id, slug, shortPath, url, title, clickCount, expiresAt, createdAt, updatedAt }`.
