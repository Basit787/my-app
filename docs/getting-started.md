# Getting started

## Prerequisites

- Docker Desktop with at least 12 GB of memory (Settings → Resources); the local AI model is killed when Docker runs out of memory.
- Node.js 20+ and pnpm 10.12.1 for running tools outside Docker.
- Python 3.12 only for running the AI summary backend outside Docker.

## Run everything

```bash
pnpm install
make            # builds and starts the whole dev stack with hot reload
make logs       # follow the app containers
make down       # stop
```

Each app reads an optional `.env` (copy its `.env.example`); the defaults work for local development. The first start downloads the AI model (~1 GB).

## URLs

- Home (launcher): `http://localhost:3000`
- Auth API: `http://localhost:3001` (Swagger `/api/docs`)
- Chat API: `http://localhost:3002` (Swagger `/docs`); chat UI: `http://localhost:3003`
- Link shortener: `http://localhost:3004`
- Image upload UI: `http://localhost:3005`; API: `http://localhost:3006`
- AI summary UI: `http://localhost:3007`; API: `http://localhost:3008` (`/docs`)
- Chatbot UI: `http://localhost:3009`; API: `http://localhost:3010` (Swagger `/docs`)
- MongoDB `localhost:27018`, PostgreSQL `localhost:5433`, MinIO `http://localhost:9000` (console `9001`), Redis `localhost:6379`, Ollama `http://localhost:11434`

Sign in with the seeded admin `admin@chat.local` / `Admin123!`, or sign up.

## Everyday commands

```bash
make rebuild                                  # after changing dependencies (npm or requirements.txt)
pnpm turbo run typecheck lint                 # every TS app and package
pnpm lint && pnpm format                      # also runs ruff for the Python app
pnpm --filter @chat/chat-app-backend test     # vitest (also auth, chatbot-backend)
make clean                                    # delete node_modules, dist, .next, .venv and caches
```

## Without Docker

```bash
make infra                                    # databases, MinIO, Redis, coturn, Ollama only
pnpm turbo run dev                            # every Node app with watchers
make -C apps/ai-summary-backend install dev   # the Python API
```

Uncomment the "Without Docker only" block of each app's `.env.example` into its `.env`.
