# AI summary API — architecture

Python 3.12 FastAPI service on port `3008` (OpenAPI docs at `/docs`). Stores uploaded `.txt` files, summarizes them with a local Ollama model in the background and pushes status changes to the browser.

## Layout (fast-api-crud structure)

- `src/main.py` — app, lifespan (create database and tables, MinIO bucket, Redis ping, resume unfinished documents), CORS, error handlers, routers.
- `src/core/` — `database.py` (SQLAlchemy engine, `SessionLocal`, `Base`), `repository.py` (`BaseRepository`), `deps.py` (`AuthRequired`), `errors.py` (`{ error, details? }`), `redis_client.py`.
- `src/router/documents/` — `model.py`, `schema.py` (camelCase replies), `repository.py`, `service.py`, `dependencies.py`, `route.py`, `summarizer.py` (background job), `events.py` (publishers).
- `src/router/events/route.py` — `GET /events` (SSE).
- `src/security/` — access-token verification against the auth JWKS (`PyJWT`), `AuthUser`.
- `src/helpers/` — `storage.py` (MinIO via boto3), `llm.py` (`openai` SDK → `{OLLAMA_URL}/v1`, chunking), `events.py` (Redis pub/sub broker).
- `src/utils/` — `env.py` (python-decouple), `init_db.py`.

## Data and services

- PostgreSQL database `ai_summary` (table `documents`: owner, filename, storage key, size, status, summary).
- MinIO bucket `ai-summaries` for the text; Redis channels `ai-summary:events:<userId>`; Ollama (`qwen2.5:1.5b` by default) defined in this app's compose files with `ollama-init` pulling the model.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)

## Tooling

- `Makefile`: `install`, `dev`, `start`, `lint`, `fix`, `format`, `format-check` (ruff); `package.json` maps them so `pnpm lint` / `pnpm format` include this app. Docker image from `docker/Dockerfile.python`.
