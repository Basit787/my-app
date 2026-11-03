# Chatbot API — configuration

Read by `libs/common/src/config/app.config.ts`.

- `PORT` — default `3010`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/chatbot` (Prisma and the checkpointer)
- `VECTOR_DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/chatbot_vectors` (pgvector; document chunks only)
- `JWT_SECRET` — verifies access tokens (same value as the auth service)
- `CORS_ORIGIN` — comma-separated allowed origins
- `OLLAMA_URL` — default `http://localhost:11434` (Docker: `OLLAMA_URL` in the root `.env`)
- `OLLAMA_MODEL` — chat model, default `qwen2.5:0.5b`; `OLLAMA_EMBED_MODEL` — embedding model, default `nomic-embed-text`
- `SEARXNG_URL` — the `web_search` tool's SearXNG, default `http://localhost:8080` (Docker: `SEARXNG_URL` in the root `.env`)
- `MAX_FILE_SIZE_MB` — upload limit, default `10`
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET` (default `chatbot`)

Outside Docker, PDFs need Poppler's `pdftotext` installed (macOS: `brew install poppler`); the Docker image gets it through the `SYSTEM_PACKAGES` build arg (`poppler-utils`).
