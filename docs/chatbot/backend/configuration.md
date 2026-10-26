# Chatbot API — configuration

Read by `libs/common/src/config/app.config.ts`.

- `PORT` — default `3010`
- `DATABASE_URL` — default `postgres://postgres:postgres@127.0.0.1:5433/chatbot` (Prisma and the checkpointer)
- `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE` — access-token verification
- `CORS_ORIGIN` — comma-separated allowed origins
- `OLLAMA_URL` — default `http://localhost:11434` (Docker: `http://ollama:11434`); `OLLAMA_MODEL` — default `qwen2.5:1.5b`
