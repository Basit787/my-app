# Image upload API — endpoints

Base URL `http://localhost:3006` (the UI calls `/api/...`); Swagger at `/docs`. Every `/images` route needs a bearer access token and only sees the caller's images. Errors are `{ error, details? }`.

- `GET /images?status=active|scheduled&page=&pageSize=` → `{ images: Image[], total, page, pageSize }`
- `GET /images/bin?page=&pageSize=` → the same page shape for binned images
- `GET /images/counts` → `{ active, scheduled, bin }`
- `POST /images` (multipart `file`, optional `scheduledAt` ISO time) → `201 Image`
- `GET /images/:id/file` → image bytes
- `DELETE /images/:id` → `{ ok: true }` (moves to the bin)
- `POST /images/:id/restore` → `Image`
- `DELETE /images/:id/permanent` → `{ ok: true }` (only binned images)

`Image`: `{ id, name, mimeType, size, status: "scheduled" | "active", scheduledAt, deletedAt, purgeAt, createdAt }`.
