# Chat API — architecture

NestJS 12 (native ESM) service behind the chat UI: REST for history, files, groups and profiles; Socket.IO for messages, presence, typing and call signaling. Port `3002`, Swagger at `/docs`.

## Building blocks

- **Features** (`src/<feature>/`): `chat` (`ChatGateway`), `messages`, `files`, `groups` (+ `RoomAccessService`), `calls` (REST + `CallsGateway` + `CallSessionService`), `users` (avatars, contacts, presence), `push` (Expo tokens). Each has a module, controller/gateway, service, `dto/` and injection specs.
- **Libraries** (`libs/`, imported as `@app/<name>`, all `@Global()`):
  - `@app/common` — `appConfig`, `HttpThrottlerGuard`, `wsValidationPipe`, response DTOs, room utils, types; re-exports `Public`, `CurrentUser`, `ApiExceptionFilter`, `httpValidationPipe` and the CORS helpers from `backend-common`.
  - `@app/auth` — `AuthCoreModule` = `AccessTokenModule.forRoot` (from `backend-common/nest`) configured from `appConfig.auth`; provides `AuthService` and the global `AuthGuard`.
  - `@app/db` — MongoDB connection, entities and one repository per collection on `BaseRepository`; `UserRepository` reads the auth service's `user` collection.
  - `@app/storage` — MinIO through `StorageService` (`createObjectStorage` from `backend-common`).
  - `@app/realtime` — `RealtimeService` (fan-out to `user:<username>` rooms) and `AuthenticatedIoAdapter` (socket handshake auth + CORS).
  - `@app/notifications` — Expo push, fire-and-forget.
- **Cross-cutting** (`src/app.module.ts`, `src/main.ts`): global `AuthGuard`, `HttpThrottlerGuard` (300 req / 15 min), `ApiExceptionFilter` (`{ error, details? }`), `httpValidationPipe`, `RequestLoggerMiddleware`, helmet, CORS, Swagger.

## Data

- MongoDB collections: `messages`, `chatgroups`, `sharedfiles`, `callhistories`, `userpresences`, `pushtokens`; users come from the auth service's `user` collection.
- MinIO bucket: shared files, group images and profile photos (`avatars/<userId>`, uploaded by the auth service).
- In memory (single instance): online presence per room and live call sessions.

## Rooms and access

- `general` — everyone; `dm..<a>..<b>` — sorted, URI-encoded usernames; `group..<groupId>` — members stored in Mongo.
- Every room read/write goes through `RoomAccessService.canAccess(room, username)`; identity always comes from the access token, never the payload.

## Interfaces

- REST endpoints: [api.md](api.md)
- Socket.IO events: [socket-events.md](socket-events.md)
- Collections: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)

## Infrastructure

- Its compose files define MongoDB (`27018`), MinIO (`9000`, console `9001`, bucket created by `minio-init`) and coturn, which the other apps reuse.
- Config comes from the environment (`appConfig`); `StorageService` refuses to start without `MINIO_ENDPOINT`.
