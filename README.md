# My Project

A pnpm + Turborepo workspace of small web apps that share one sign-in. Every backend is NestJS on PostgreSQL (Prisma), every frontend is React + Vite + TanStack Router with a shared shadcn/ui design system, and the AI features run on a local Ollama model — no paid API keys.

## Apps

| App            | Frontend                                | Backend                                | What it does                                                                                                     |
| -------------- | --------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Home           | `apps/home` — `3000`                    | —                                      | Sign-in and launcher: one card per app                                                                           |
| Auth           | —                                       | `apps/auth` — `3001`                   | Register, log in, JWT for every API, profile photo, delete account                                               |
| Link shortener | `apps/link-shortener-frontend` — `3004` | `apps/link-shortener-backend` — `3012` | Short links with custom slugs, expiry and 30-day click stats                                                     |
| Image upload   | `apps/image-upload-frontend` — `3005`   | `apps/image-upload-backend` — `3006`   | Gallery with scheduled uploads (BullMQ) and a bin that purges itself                                             |
| AI summary     | `apps/ai-summary-frontend` — `3007`     | `apps/ai-summary-backend` — `3008`     | Upload `.txt` files; summaries by the local model, status pushed over SSE                                        |
| Chatbot        | `apps/chatbot-frontend` — `3009`        | `apps/chatbot-backend` — `3010`        | ChatGPT-style chat (LangGraph): streamed replies, answers from uploaded documents (pgvector), web search tool    |
| Invoices       | `apps/invoice-frontend` — `3014`        | `apps/invoice-backend` — `3013`        | Upload PDF, XML or image invoices; fields read by XML parsing, text layer or OCR + the model; edit and re-export |

Shared code lives in `packages/`:

| Package                                        | Purpose                                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `my-ui`                                        | shadcn/ui components (Tailwind 4) and `MyUi*` wrappers: forms, dialogs, data tables, sidebar layout, theme      |
| `frontend-common`                              | App providers, API client, auth client + `AuthGate` / `LoginScreen` / account pages, navigation, legal pages    |
| `backend-common`                               | JWT sign/verify, `AuthGuard`, `@Public()`, `@CurrentUser()`, error filter, validation pipe, S3, BullMQ, Swagger |
| `ports`                                        | Every app's port and `serviceUrl()` for links between apps                                                      |
| `vite-config`                                  | `defineAppConfig({ port, api })`: React, router plugin, Tailwind, `/api` and `/auth-api` proxies                |
| `eslint-config`, `prettier-config`, `tsconfig` | Shared tooling presets                                                                                          |

## Quick start

Requirements: Docker Desktop, Node.js 24.22.1+ (`nvm use` reads `.nvmrc`) and pnpm 10.12.1. Ollama and SearXNG run outside Docker; set `OLLAMA_URL` and `SEARXNG_URL` in the root `.env` (created from `.env.example` by `make`).

```bash
pnpm install
make                      # builds and starts the whole stack with hot reload
```

Open `http://localhost:3000`, register an account and pick an app.

Each backend seeds demo data on start once these accounts exist (register them first): `admin@chat.local` / `Admin123!`, `alice@chat.local` / `Alice123!`, `bob@chat.local` / `Bob12345!`.

## Commands

```bash
make                    # dev stack (docker-compose.dev.yml), hot reload
make prod               # prod stack (docker-compose.prod.yml), prod images
make full               # local only: dev stack plus S3 (floci), Ollama and SearXNG (docker-compose.full.yml)
make down               # stop
make rebuild            # after changing dependencies (images bake node_modules in)
make clean              # delete node_modules, dist and caches; `make install` afterwards
docker compose -f docker-compose.dev.yml logs -f  # follow the containers

pnpm turbo run typecheck lint                       # every app and package
pnpm format                                         # Prettier everywhere
pnpm --filter @chat/chatbot-backend db:migrate      # new Prisma migration for one backend
```

## Services and URLs

| Service         | URL                                                           |
| --------------- | ------------------------------------------------------------- |
| Home            | `http://localhost:3000`                                       |
| Auth API        | `http://localhost:3001` (Swagger `/docs`)                     |
| Every other API | its port above, Swagger at `/docs`                            |
| PostgreSQL      | `localhost:5433` (one database per app, pgvector)             |
| Redis           | `localhost:6379` (BullMQ, pub/sub)                            |
| Object storage  | `S3_ENDPOINT` in the root `.env` (any S3-compatible store)    |
| Ollama          | `OLLAMA_URL` in the root `.env` (`qwen2.5:0.5b`, `nomic-embed-text`) |
| SearXNG         | `SEARXNG_URL` in the root `.env` (chatbot web search)              |

Apps on the same host share the sign-in (the token is kept in a cookie, and cookies ignore the port). Other devices on the same Wi-Fi can open `http://<your-ip>:3000`.

## How it fits together

```text
Browser ── http://localhost:<port> ── the app's Vite server (proxies /auth-api and /api)
  ├─ /auth-api/* ─► auth (3001)              register / login → JWT (HS256, JWT_SECRET)
  ├─ /api/*      ─► the app's backend         Authorization: Bearer <JWT>, verified by backend-common
  └─ /*          ─► the page itself

Backends ─► PostgreSQL (Prisma) · Redis (BullMQ, pub/sub) · S3 at S3_ENDPOINT (files) · Ollama (local model)
```

- Every app publishes its own port; there is no gateway in front of them.
- Every backend route needs a bearer token unless marked `@Public()`; errors are always `{ error, details? }`.
- Background results are pushed, never polled: SSE for summaries and invoices, NDJSON streams for chat replies.
- Dependency versions are pinned once in the root `package.json`; apps list them as `"*"`.

## Documentation

Everything else — architecture, flows, endpoints, data models and configuration for each app — is in [`docs/`](docs/README.md).
