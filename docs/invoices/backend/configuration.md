# Invoice API — configuration

Read by `libs/common/src/config/app.config.ts` (and `JWT_SECRET` by `backend-common`).

- `PORT` — default `3013`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/invoices`
- `JWT_SECRET` — verifies access tokens (same value as the auth service)
- `CORS_ORIGIN` — comma-separated allowed origins, default every web app on `localhost`
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` (`invoices`), `S3_REGION`
- `REDIS_URL` — default `redis://127.0.0.1:6379`
- `OLLAMA_URL` — default `http://localhost:11434` (Docker: `OLLAMA_URL` in the root `.env`); `OLLAMA_MODEL` — default `qwen2.5:0.5b` (`qwen2.5:7b` reads fields more accurately but needs about 5 GB of memory)
- `OCR_LANGUAGES` — Tesseract languages, default `eng` (e.g. `eng+deu`; each needs its `tesseract-ocr-data-<lang>` package in the image)
- `OCR_MAX_PAGES` — pages past this are skipped, default `30`
- `MAX_FILE_SIZE_MB` — default `20` (keep the frontend's `src/lib/max-file-size.ts` equal)

## System tools

- Docker: the image installs Tesseract, Poppler and Liberation fonts through the `SYSTEM_PACKAGES` build arg (`INVOICE_SYSTEM_PACKAGES` in the root `.env` overrides the list).
- Outside Docker: `brew install tesseract poppler`.
