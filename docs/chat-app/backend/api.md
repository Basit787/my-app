# Chat API — REST endpoints

Base URL `http://localhost:3002` (the UI calls it as `/api/...` through Vite). Every route needs `Authorization: Bearer <accessToken>` unless marked public. Errors are `{ error, details? }`.

## Messages and files

- `GET /rooms/:room/messages` → `{ messages: ChatMessage[] }`
- `DELETE /rooms/:room/messages/:id` → `{ ok: true }` (soft delete; recipients get `message_deleted`)
- `POST /rooms/:room/files` (multipart `file`, optional `caption`) → `ChatMessage` of type `file`
- `GET /rooms/:room/files/:id` → file bytes (streamed)

`ChatMessage`: `{ id, room, user, text, type: "text" | "file", file?: { id, name, mimeType, size }, deleted?, status?: "sent" | "delivered" | "read", at }` — `status` only on the caller's own messages.

## Groups

- `GET /groups` → `{ groups: ChatGroup[] }`
- `POST /groups` `{ name, members, description? }` → `ChatGroup`
- `GET /groups/:groupId`, `PATCH /groups/:groupId` `{ name?, description? }` (creator only) → `ChatGroup`
- `POST /groups/:groupId/avatar` (multipart `photo`) → `{ image }`; `DELETE /groups/:groupId/avatar` → `{ ok: true }`
- Public `GET /groups/:groupId/avatar` → image bytes

`ChatGroup`: `{ id, name, description, image, room, members, createdBy, createdAt, updatedAt }`.

## People

- `GET /contacts` → `{ contacts: { name, image }[] }`
- `GET /profile/status`, `PATCH /profile/status` `{ status: "online" | "away" | "busy" | "offline" }` → `{ status }`
- Public `GET /profile/avatars/:userId`, `GET /profile/avatars/by-name/:username` → image bytes

## Calls and push

- `GET /calls/history?peer=` → `{ calls: { id, caller, callee, callType, status, startedAt, endedAt, durationSeconds? }[] }`
- `GET /webrtc/config` → `{ iceServers: { urls, username?, credential? }[] }`
- `POST /push/tokens` `{ token, platform?: "ios" | "android" }`, `DELETE /push/tokens` `{ token }` → `{ ok: true }`
- Public `GET /health` → `{ ok: true }`

Full schemas: Swagger at `/docs` (`/docs/openapi.json`).
