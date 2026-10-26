# Chat API — data model

MongoDB database `realtime_chat` (collections keep their historical names). Repositories in `libs/db/src/repositories/`.

## `messages`

- `room`, `user` (username), `userId`, `type` (`text` | `file`), `text`, `file` (shared-file reference), `deleted`, `deliveredTo[]`, `readBy[]`, `at`
- Deletes are soft: `deleted: true` with blank text/file; reads filter `deleted: { $ne: true }`.

## `chatgroups`

- `name`, `description`, `image`, `members[]` (usernames), `createdBy`, timestamps; the room is `group..<id>`.

## `sharedfiles`

- `room`, `user`, `userId`, `originalName`, `mimeType`, `size`, `storedName` (MinIO key, unique), `at`

## `callhistories`

- `caller`, `callee`, `callType` (`audio` | `video`), `status` (`completed` | `missed` | `rejected` | `cancelled`), `startedAt`, `endedAt`, `durationSeconds`

## `userpresences`

- `username`, `status` (`online` | `away` | `busy` | `offline`), `updatedAt`

## `pushtokens`

- `token`, `username`, `platform`

## Read-only

- `user` — the auth service's better-auth users (names, avatars), read through `UserRepository`.

## Outside MongoDB

- MinIO bucket `chat-uploads`: attachments, group images, `avatars/<userId>`.
- Memory: room presence and live call sessions (single instance).
