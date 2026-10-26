# Image upload API — endpoints

Base URL `http://localhost:3006` (the UI calls `/api/...`). Every `/images` route needs a bearer access token and only sees the caller's images. Errors are `{ error }`.

- `GET /images?status=active|scheduled&page=` → `{ images: Image[], total, page, pageSize }`
- `GET /images/bin?page=` → the same page shape for binned images
- `GET /images/counts` → `{ active, scheduled, bin }`
- `POST /images` (multipart `file`, optional `scheduledAt` ISO time) → `Image`
- `GET /images/:id/file` → image bytes
- `DELETE /images/:id` → `{ ok: true }` (moves to the bin)
- `POST /images/:id/restore` → `Image`
- `DELETE /images/:id/permanent` → `{ ok: true }` (only binned images)
- `GET /health` → `{ ok: true }`

`Image`: `{ id, name, mimeType, size, status: "scheduled" | "active", scheduledAt, deletedAt, purgeAt, createdAt }`.
