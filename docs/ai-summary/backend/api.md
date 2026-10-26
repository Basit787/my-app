# AI summary API — endpoints

Base URL `http://localhost:3008` (the UI calls `/api/...`); OpenAPI docs at `/docs`. Every route except `/health` needs a bearer access token and only sees the caller's documents. Errors are `{ error, details? }`.

- `GET /documents` → `Document[]` (newest first)
- `POST /documents/upload` (multipart `file`, `.txt`, UTF-8, ≤ `MAX_FILE_SIZE_MB`) → `201 Document` (status `UPLOADED`; the summary runs in the background)
- `GET /documents/{id}` → `Document`
- `POST /documents/{id}/summarize` → `202 Document` (only for `FAILED`; 409 otherwise)
- `DELETE /documents/{id}` → `{ message }`
- `GET /events` → `text/event-stream`; each event is `data: { type: "document.updated", document }` or `data: { type: "document.deleted", id }`, with `: ping` every 15 s
- `GET /health` → `{ status: "ok" }`

`Document`: `{ id, filename, size, status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED", summary, createdAt, updatedAt }`.
