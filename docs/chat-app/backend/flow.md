# Chat API — flows

## Connecting

```mermaid
sequenceDiagram
    participant UI as Chat UI
    participant Auth as Auth service
    participant IO as AuthenticatedIoAdapter
    participant GW as ChatGateway
    UI->>Auth: POST /api/token (session cookie)
    Auth-->>UI: accessToken (15 min)
    UI->>IO: socket.io connect, auth.token
    IO->>IO: verify token (backend-common/auth)
    IO->>GW: handleConnection(user)
    GW->>GW: join "general" and "user:<username>", mark online
    GW-->>UI: presence
```

The client's `auth` callback fetches a fresh token on every reconnect.

## Sending a message

```mermaid
sequenceDiagram
    participant A as Sender
    participant GW as ChatGateway
    participant RA as RoomAccessService
    participant DB as MongoDB
    participant RT as RealtimeService
    participant B as Recipients
    A->>GW: message {room, text}
    GW->>RA: canAccess(room, username)
    GW->>DB: create message
    GW->>RT: emitToRoomParticipants(room, "message")
    RT-->>A: message
    RT-->>B: message (on every device, chat open or not)
    B->>GW: message:ack / room:read
    GW-->>A: message:status (delivered / read)
```

Push notifications are sent with `void`, so a push failure never blocks delivery.

## Files and history

1. The UI uploads with `POST /rooms/:room/files` (multer limits from `createUploadOptions`).
2. The service checks room access, stores the bytes in MinIO and the metadata in `sharedfiles`, creates a message and fans it out like a text message.
3. History is `GET /rooms/:room/messages`; deleted messages stay as `deleted: true` with blank text so receipts and "message deleted" still render.

## 1:1 calls

```mermaid
sequenceDiagram
    participant A as Caller
    participant S as CallSessionService
    participant B as Callee devices
    A->>S: call:invite
    S-->>B: call:incoming (every device)
    S-->>A: call:ringing
    A->>S: call:offer / call:ice-candidate
    S-->>B: offer + ICE (buffered, replayed to a device that connects late)
    B->>S: call:answer (one device)
    S-->>B: call:end (the other devices)
    S-->>A: call:answer
    A-->>B: WebRTC media (TURN via coturn when needed)
    A->>S: call:end
    S-->>A: call:history
```

Group calls use `group-call:*` events; signaling reaches all of a user's devices and only the one in the call acts on it.
