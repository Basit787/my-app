# Link shortener API — endpoints

Base URL `http://localhost:3012` (the UI calls `/api/...` and `/r/...` on its own port); Swagger at `/docs`. Every `/links` route needs a bearer token and only sees the caller's links. Errors are `{ error, details? }`.

- `GET /links` → `{ links: Link[] }` (newest first)
- `POST /links` `{ url, slug?, title?, expiresAt? }` → `201 Link`; `url` is http(s), `slug` 3–64 letters, digits, `-` or `_` (random when missing), `expiresAt` ISO 8601; `409` when the slug is taken
- `GET /links/:id` → `Link`
- `PATCH /links/:id` `{ url?, slug?, title?, expiresAt? }` → `Link` (`expiresAt: null` removes the expiry)
- `DELETE /links/:id` → `{ ok: true }`
- `GET /links/:id/stats` → `{ linkId, totalClicks, days: { day, count }[] }` (the last 30 days, one entry per day)
- Public `GET /r/:slug` → `302` to the target URL, recording one click with referrer and user agent; `404` when missing or expired

`Link`: `{ id, slug, shortPath, url, title, clickCount, expiresAt, createdAt, updatedAt }`.
