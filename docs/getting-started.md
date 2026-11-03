# Getting started

## Prerequisites

- Docker Desktop.
- Node.js 24.22.1+ (`nvm use` reads `.nvmrc`) and pnpm 10.12.1 for running tools outside Docker.
- Ollama (with `qwen2.5:0.5b` and `nomic-embed-text` pulled) and SearXNG (JSON format enabled), reachable at `OLLAMA_URL` / `SEARXNG_URL` in the root `.env`.

## Run everything

```bash
pnpm install
make                      # builds and starts the whole dev stack with hot reload
docker compose -f docker-compose.dev.yml logs -f    # follow the containers
make down                 # stop
```

Each app reads an optional `.env` (copy its `.env.example`); the defaults work for local development. The Docker stack reads the root `.env`, which `make` copies from the root `.env.example` the first time.

## URLs

- Home (sign-in and launcher): `http://localhost:3000`
- Auth API: `http://localhost:3001` (Swagger `/docs`)
- Link shortener: `http://localhost:3004`, API `http://localhost:3012`
- Image upload: `http://localhost:3005`, API `http://localhost:3006`
- AI summary: `http://localhost:3007`, API `http://localhost:3008`
- Chatbot: `http://localhost:3009`, API `http://localhost:3010`
- Invoices: `http://localhost:3014`, API `http://localhost:3013`
- Every API serves Swagger at `/docs`.
- PostgreSQL `localhost:5433`, Redis `localhost:6379`; Ollama and SearXNG at `OLLAMA_URL` / `SEARXNG_URL` from the root `.env`

Sign in once on any app; the others on the same host are signed in too. Every API answers 401 without a token.

## Accounts and demo data

- Register on any app's login screen; nothing is seeded in the auth service.
- The link shortener, image upload, AI summary and chatbot backends run `prisma db seed` on start. The seed logs in as `admin@chat.local` / `Admin123!`, `alice@chat.local` / `Alice123!` and `bob@chat.local` / `Bob12345!` and adds demo data for each; it is skipped until those accounts are registered. Run it again later with `pnpm --filter <app> db:seed`.

## Other devices on the same Wi-Fi

1. Find the Mac's Wi-Fi address: `ipconfig getifaddr en0` (for example `10.10.40.187`).
2. On any device on that Wi-Fi, open `http://10.10.40.187:3000` and sign in; the app cards open the other apps on the same address (`http://10.10.40.187:3009`, …).

- The dev servers listen on every interface and accept IP addresses; links between apps use the address the page was opened from (`serviceUrl`).
- The sign-in is per address: `localhost` and the Wi-Fi address each need their own.
- If macOS's firewall is on, allow incoming connections for Docker (System Settings → Network → Firewall).

## Everyday commands

```bash
make rebuild                                     # after changing dependencies
pnpm turbo run typecheck lint                    # every app and package
pnpm format                                      # Prettier everywhere
pnpm --filter @chat/chatbot-backend db:migrate   # new Prisma migration (every backend has one)
make clean                                       # delete node_modules, dist and caches; `make install` afterwards
```

## Without Docker

```bash
docker compose -f docker-compose.dev.yml up -d postgres redis   # shared services only
pnpm turbo run dev                                     # every app and package watcher; DATABASE_URL etc. from each app's .env
```

- Copy each app's `.env.example` to `.env`; the defaults point at `localhost`.
- The chatbot needs Poppler (`brew install poppler`); the invoice backend needs Poppler and Tesseract (`brew install poppler tesseract`).
