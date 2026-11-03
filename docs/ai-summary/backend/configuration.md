# AI summary API — configuration

Read by `libs/common/src/config/app.config.ts` (and `JWT_SECRET` by `backend-common`).

- `PORT` — default `3008`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/ai_summary`
- `JWT_SECRET` — verifies access tokens (same value as the auth service)
- `CORS_ORIGIN` — comma-separated allowed origins, default every web app on `localhost`
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` (`ai-summaries`), `S3_REGION`
- `REDIS_URL` — default `redis://127.0.0.1:6379`
- `OLLAMA_URL` — default `http://localhost:11434` (Docker: `OLLAMA_URL` in the root `.env`); `OLLAMA_MODEL` — default `qwen2.5:0.5b`
- `MAX_FILE_SIZE_MB` — default `1` (keep the frontend's `src/lib/max-file-size.ts` equal)
- `AUTH_URL` — only for `prisma db seed`, which logs in as the demo users
