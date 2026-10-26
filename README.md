# Real-Time Chat Application

**Socket.io** + **Express** + **React** with **Mongoose/MongoDB**, real-time chat, **private DMs**, **audio/video calls** (WebRTC), and **file sharing** — all via Docker.

## Start (Docker)

```bash
make
```

Or:

```bash
./docker/up.sh
```

| Service | URL / Port |
|---------|------------|
| **UI** | http://localhost:5176 |
| **API** (direct) | http://localhost:3004 |
| **MongoDB** | localhost:27018 |
| **MinIO API** | http://localhost:9000 |
| **MinIO Console** | http://localhost:9001 (login: minioadmin / minioadmin) |
| **TURN/STUN** (coturn) | localhost:3478 |

Copy `apps/server/.env.example` to `apps/server/.env` (and `apps/client/.env.example` to `apps/client/.env`) to customize secrets and TURN settings; compose reads each app's `.env` from its own folder.

## Development (live reload)

`make` / `./docker/up.sh` starts Docker with **hot reload** — edit `apps/client/src` or `apps/server/src` and changes apply without restarting containers.

- **Client:** Vite dev server + HMR on port 5176
- **Server:** `tsx watch` restarts on file changes

## Monorepo

pnpm workspaces + [Turborepo](https://turborepo.com):

```text
apps/client              React + Vite app (@chat/client)
apps/server              Express + Socket.IO API (@chat/server)
apps/mobile              Expo + NativeWind app (@chat/mobile)
packages/ui              design system for both clients: src/web (@chat/ui), src/native (@chat/ui/native), src/styles (web.css → generated native.css)
packages/frontend-common shared by web and mobile: chat types, endpoints, room naming, message/presence helpers, formatters
packages/backend-common  shared Express helpers: errors, async handler, validation, S3/MinIO storage + uploads
packages/eslint-config   shared ESLint presets (base / react / react-native / node)
packages/prettier-config shared Prettier config
packages/tsconfig        shared TypeScript presets
docker/                  all Docker setup: the one Dockerfile (APP build arg, dev/prod targets), its .dockerignore, the stack compose files, compose.sh and up.sh
```

Each app owns its compose files and `.env` (`apps/<app>/docker-compose.{dev,prod}.yml`, `apps/<app>/.env.example`); the server's also start MongoDB, MinIO and coturn. `make` runs `docker/compose.sh`, which regenerates `docker/docker-compose.{dev,prod}.yml` to `include` every app's compose file, so a new app only needs its own.

All dependency versions are declared once in the root `pnpm-workspace.yaml`: `"catalog:"` for shared ones, `"catalog:native"` for Expo / React Native ones.

```bash
npx -y pnpm@10.12.1 install                    # or `pnpm install` if pnpm is installed
npx -y pnpm@10.12.1 turbo run build            # builds packages, then apps
npx -y pnpm@10.12.1 turbo run typecheck lint
```

If you add npm dependencies, rebuild app images:

```bash
make rebuild
```

For a production-style build (static client, compiled server):

```bash
make prod
```

## Mobile app

`apps/mobile` is an Expo development build (calls need native WebRTC, so Expo Go cannot run it).

```bash
cp apps/mobile/.env.example apps/mobile/.env   # set EXPO_PUBLIC_API_URL to your computer's LAN IP, e.g. http://192.168.1.20:3004
pnpm --filter @chat/mobile exec expo run:ios   # or expo run:android — builds and installs the app once
pnpm --filter @chat/mobile dev                 # afterwards: Metro with hot reload
```

Push notifications (messages and incoming calls when the app is closed) need an EAS project: run `eas init` in `apps/mobile`, and add FCM / APNs credentials with `eas credentials` for real devices.

## Default admin

On first startup the server seeds an admin user:

- Email: `admin@chat.local`
- Password: `Admin123!`

Override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `.env`.

## App flow

### 1. Auth
Register or sign in at http://localhost:5176 → bearer token stored → socket connects.

### 2. General channel (`#general`)
- Public room — all online users see the same messages.
- Messages persist in MongoDB under room `general`.

### 3. Direct messages (DM)
- Click an online user in the sidebar (or start chatting with someone from message history).
- Messages go to a **private room** `dm..userA..userB` (sorted usernames).
- Only the two participants can read/send in that room.
- Socket auto-joins the DM room when you open the conversation.

### 4. Audio / video calls
- Open a **DM** conversation (not `#general`).
- Use phone / video buttons in the chat header.
- Flow: invite → callee accepts → WebRTC offer/answer via Socket.io → media via P2P + coturn TURN.
- Calls work across users regardless of which room they are viewing.

### 5. File sharing
- Attach files in any conversation (general or DM).
- Files, profile photos, and group images are stored in **MinIO** (S3-compatible object storage).

## Architecture

```
Browser (5176)
  ├─ /api/*     → Vite proxy → server:3004
  └─ /socket.io → Vite proxy → server:3004 (WebSocket)

server:3004
  ├─ better-auth  /auth/*
  ├─ REST         /rooms/:room/messages, /rooms/:room/files
  ├─ Socket.io    message, typing, presence, call:*
  ├─ MongoDB      mongo:27017
  └─ MinIO        minio:9000 (bucket: chat-uploads)

coturn:3478       STUN/TURN for WebRTC
minio:9000        Object storage (files, avatars, group images)
minio:9001        MinIO web console
```

`MINIO_ENDPOINT` is **required**. Chat attachments, profile photos, and group images are stored only in MinIO (MongoDB keeps metadata and references).

## WebRTC / TURN

Calls use the **coturn** container. For local Docker, `TURN_HOST=localhost` works from the browser.

On a remote server set in `.env`:

- `TURN_EXTERNAL_IP` — your public IP
- `TURN_HOST` — hostname browsers can reach

## Local dev (without Docker)

```bash
pnpm install
pnpm turbo run dev   # watches the packages and runs the server and client together
```

The server needs MongoDB and MinIO running (for example the `mongo` and `minio` services from `docker/docker-compose.dev.yml`).

Client dev server: http://localhost:5176 (proxies API to port 3004).

MIT
