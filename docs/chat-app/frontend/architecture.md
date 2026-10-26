# Chat UI — architecture

React 19 + Vite + TanStack Router app on port `3003`. Talks to the chat API (`/api`, Vite proxy) and Socket.IO (`/socket.io`), and signs in through the auth service (`/auth-api`).

## Layout

- `src/routes/` — `__root.tsx` mounts `AppProviders` from `frontend-common` (theme, React Query, auth session, tooltips, toasts); `index.tsx` renders `AuthGate` → `ChatPage`. `routeTree.gen.ts` is generated.
- `src/features/chat/` — `api/` (`endpoint.ts`, `api.ts` with every call in try/catch + `toApiError`, `hooks.ts` with TanStack Query), `store/` (zustand slices combined in `chat-store.ts`: messages, conversations, presence, unread, compose, calls, group calls, selection, search, …), `context/`, `chat-page.tsx`.
- `src/features/profile/` — presence status API and hooks.
- `src/components/` — `chat/` (message list, bubbles, input, dialogs for groups, forwarding, emoji), `call/`, `profile/`, `layout/`, `avatar/`, `brand/`.
- `src/lib/` — `auth.ts` (`createAuthClient`), `api-client.ts` (`createAppApiClient`), `query-client.ts` (`createQueryClient`), `auth-store.ts` (read-only zustand mirror of the user), `useSocket.ts`, `useWebRTC.ts`, `useGroupWebRTC.ts`, media/receipt/emoji helpers.

## State

- Server data is fetched with React Query and synced into the zustand store; socket events write into the same store through `useChatStore.getState()`, so components read one source.
- Shared chat types, endpoints, room naming and conversation building come from `frontend-common/src/chat`.

## UI kit

- Every primitive and wrapper comes from `my-ui` (`MyUi*`); shared screens (login, account settings, user menu) come from `frontend-common`.

## Realtime and calls

- `useSocket` owns the Socket.IO connection and routes `message`, `message:status`, `message_deleted`, `presence`, `typing`, `call:history`, `group-call:*` into the stores.
- `useWebRTC` (1:1) and `useGroupWebRTC` (mesh group calls) handle peer connections; ICE servers come from `GET /webrtc/config`.
- Camera and microphone need HTTPS off localhost: `DEV_HTTPS=true` serves Vite over a self-signed certificate.
