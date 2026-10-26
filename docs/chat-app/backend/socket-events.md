# Chat API — Socket.IO events

Connect to `/socket.io` with `auth: { token: <accessToken> }`. Every socket joins `general` and `user:<username>`. Payloads are validated; invalid ones are ignored.

## Client → server

- `message` `{ room, text }` — send a text message
- `message:ack` `{ room, messageId }` — mark a message delivered
- `room:join` / `room:leave` `{ room }` — open or close a conversation (presence per room)
- `room:read` `{ room, messageId }` — mark messages up to this one read
- `typing` `{ room }`
- `status:set` `{ status }`
- `call:invite`, `call:offer`, `call:answer`, `call:ice-candidate`, `call:reject`, `call:end` — 1:1 call signaling
- `group-call:start`, `group-call:join`, `group-call:offer`, `group-call:answer`, `group-call:ice-candidate`, `group-call:leave` — group call signaling

## Server → client

- `message` — a new message (to every participant, on every device)
- `message:status` — delivered/read updates for the sender
- `message_deleted` — a message was soft-deleted
- `presence` — who is online in a room, with status
- `typing` — someone is typing in a room
- `call:incoming`, `call:ringing`, `call:offer`, `call:answer`, `call:ice-candidate`, `call:reject`, `call:end`, `call:history`
- `group-call:incoming`, `group-call:state`, `group-call:offer`, `group-call:answer`, `group-call:ice-candidate`, `group-call:ended`

The server side lives in `src/chat/chat.gateway.ts` and `src/calls/calls.gateway.ts`; the client side in `apps/chat-app-frontend/src/lib/useSocket.ts`, `useWebRTC.ts` and `useGroupWebRTC.ts`. Change both together.
