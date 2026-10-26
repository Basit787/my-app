# AI summary API — configuration

Read by `src/utils/env.py` (python-decouple: environment first, then `.env`).

- `DATABASE_URL` — default `postgresql://postgres:postgres@127.0.0.1:5433/ai_summary`
- `CORS_ORIGIN` — default `http://localhost:3007`
- `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE` — access-token verification
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` (`ai-summaries`), `MINIO_REGION`
- `REDIS_URL` — default `redis://localhost:6379`
- `OLLAMA_URL` — default `http://localhost:11434` (Docker: `http://ollama:11434`); `OLLAMA_MODEL` — default `qwen2.5:1.5b`
- `MAX_FILE_SIZE_MB` — default `1`
- Port `3008` is set by the Makefile / compose (`PORT` in Docker).
