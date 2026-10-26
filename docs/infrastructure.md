# Infrastructure

## Docker layout

- Everything Docker lives in `docker/`: `Dockerfile` (every Node app; `APP` build arg, `dev` and `prod` targets), `Dockerfile.python` (the FastAPI app; context is the app folder), their `.dockerignore` files and `packages.dev.yml`. Helper scripts (`compose.sh`, `up.sh`) live in `scripts/`.
- Each app owns `docker-compose.dev.yml` and `docker-compose.prod.yml`. `scripts/compose.sh` regenerates `docker/docker-compose.{dev,prod}.yml`, which only `include` every app's file; `make` calls it.
- Dev containers bind-mount source folders, so edits hot-reload; dependency changes need `make rebuild`.
- The `packages` service runs the tsup watchers for `my-ui`, `frontend-common`, `backend-common` and `ports` once and shares their `dist/` with every app.

## Shared services

Each service is defined once, in the app that owns it, and reused by the others through `depends_on`:

- MongoDB (`27018`) — `apps/chat-app-backend`; used by auth and the chat API.
- MinIO (`9000`, console `9001`) + `minio-init` — `apps/chat-app-backend`; buckets for chat files and avatars, images, AI summary texts.
- coturn — `apps/chat-app-backend`; TURN relay for WebRTC calls.
- PostgreSQL (`5433`) — `apps/link-shortener`; databases `link_shortener`, `image_upload`, `ai_summary`, `chatbot` (each app creates its own on first start).
- Redis (`6379`) — `apps/image-upload-backend`; BullMQ queues and AI summary event pub/sub.
- Ollama (`11434`, image `alpine/ollama`) + `ollama-init` — `apps/ai-summary-backend`; serves the local model (default `qwen2.5:1.5b`) to the AI summary and chatbot backends.

## Memory

- The dev stack (five Vite servers, Next.js, three Nest apps, watchers) uses about 7 GB; the model needs about 1.3 GB more. Give Docker Desktop 12 GB.
- Ollama keeps one model loaded (`OLLAMA_MAX_LOADED_MODELS=1`, `OLLAMA_NUM_PARALLEL=1`, context 8192).
- For speed, run Ollama natively on the Mac (GPU) and set `OLLAMA_URL=http://host.docker.internal:11434` in the AI summary and chatbot backends' `.env`.

## Production build

- `make prod` builds the `prod` targets (compiled apps, `vite preview` / `next start` / `node dist`), without bind mounts or watchers.
