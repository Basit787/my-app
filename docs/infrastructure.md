# Infrastructure

## Docker layout

- Three compose files at the root. `docker-compose.dev.yml` (`make`): Postgres, Redis, the `packages` watcher, and every backend and frontend on its `dev` target (folder mounted for hot reload). `docker-compose.prod.yml` (`make prod`): Postgres, Redis and every app on its `prod` target, with no source mounts and no database ports published. Each app publishes its own port. `docker-compose.full.yml` (`make full`, local use only): the dev stack plus floci (S3 on `4566`), Ollama (`11434`, pulls `qwen2.5:0.5b` and `nomic-embed-text` on first start) and SearXNG (`8080`), with every setting written in the file, so it needs no `.env`.
- `docker/backend/Dockerfile` builds every Node backend and `docker/frontend/Dockerfile` every web app; the `APP` build arg picks the project. Both have `dev` and `prod` targets; a frontend's `prod` serves its build with `vite preview` (same port and `/api`, `/auth-api` proxies as dev). One `.dockerignore` at the root covers both, because the build context is the repo root.
- Both Dockerfiles: `deps` runs `pnpm fetch` from the lockfile (cached), copies the repo, installs offline and builds the shared packages; `dev` runs the app's `dev` script. Backend `prod`: `pnpm deploy --prod` copies the app with only its production dependencies (workspace packages included) plus `dist/`, regenerates the Prisma client, and runs on a clean `node:24.22.1-alpine` with `npm start` (`prisma migrate deploy`, then `node dist/src/main.js`). Frontend `prod`: builds the app and serves it with `vite preview`.
- The backend image's `SYSTEM_PACKAGES` build arg adds Alpine packages: Poppler for the chatbot; Tesseract, Poppler and fonts for the invoice backend (set in the compose files).
- Backends run `prisma migrate deploy` before starting (and `prisma db seed` where there is a seed), so every database and table exists after `make`.
- `make` (= `make up`) builds and starts the dev stack, `make prod` / `make prod-down` the prod stack; `make rebuild` after dependency changes, because the images bake `node_modules` in.
- The `packages` service runs the tsup watchers for `my-ui`, `frontend-common`, `backend-common` and `ports` and shares their `dist/` with every app container.

## Access and sign-in

- Every app keeps its own port (`packages/ports`), published by its own container: home `3000`, auth `3001`, link shortener `3004`/`3012`, image upload `3005`/`3006`, AI summary `3007`/`3008`, chatbot `3009`/`3010`, invoices `3014`/`3013`.
- One sign-in for every app: the auth service returns a JWT signed with `JWT_SECRET` (HS256), which the client saves in the `access_token` cookie; cookies ignore the port, so every app on the same host shares it. Every backend verifies the token with the same `JWT_SECRET`.
- Every backend route needs `Authorization: Bearer <token>` (shared `AuthGuard`, `@Public()` for the few open routes) and answers `401 { error }` without it; every web app shows the shared login screen until signed in.

## Shared services

- PostgreSQL (`5433` on the host, container `postgres`, `pgvector/pgvector:pg16`, volume `postgres_data`) — every app database: `auth`, `link_shortener`, `image_upload`, `ai_summary`, `chatbot`, `invoices`, and `chatbot_vectors` for the chatbot's document chunks. Each app creates its own database on first start. User and password are `postgres` / `postgres`.
- Redis (`6379`, `redis:7.4-alpine`, volume `redis_data`) — BullMQ queues and event pub/sub.
- Object storage — none in the stack. Set `S3_ENDPOINT` (any S3-compatible store, e.g. AWS S3, MinIO, R2), `S3_REGION`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`; each backend creates its bucket on start. Without it the apps still start and log a warning, and every upload or download answers `503 { error: "Object storage is not configured: set S3_ENDPOINT" }`; an unreachable store answers `503 { error: "Object storage is unavailable: …" }`.
- Settings: `x-app` (restart policy, the packages' `dist/`) is shared by every app with `<<: *app`, and `x-backend-env` (shared backend environment) by every backend with `<<: *backend-env`; each backend adds its own `DATABASE_URL`. Values you may change come from the root `.env`, which `make` creates from `.env.example` when it is missing. Backends start once Postgres (and Redis, where used) are healthy.
- Health checks: the `healthcheck` in `x-app` applies to every app, so every backend and frontend is healthy once it accepts connections on its `PORT` (`nc -z`, 3 minutes allowed for start-up). Each app sets `PORT` to its published port; backends also listen on it.
- Ollama and SearXNG — not in either stack: the backends call `OLLAMA_URL` (models `OLLAMA_MODEL`, `OLLAMA_EMBED_MODEL`) and `SEARXNG_URL` from the root `.env`; locally by default Ollama and SearXNG running on the Mac (`host.docker.internal`), on a server wherever they are hosted. SearXNG must have the `json` format enabled.

## Memory

- The dev stack no longer runs Ollama, so the models use the Mac's memory instead of Docker's.
