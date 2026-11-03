# Chatbot UI — architecture

React + Vite + TanStack Router app on port `3009`; API at `/api` (chatbot backend), auth at `/auth-api`.

## Layout

- `src/routes/` — `__root.tsx` (`AppProviders` from `frontend-common`), `index.tsx` (`AuthGate` → `ChatPage`; `?c=<conversationId>` selects the chat).
- `src/features/chat/`:
  - `api/` — `endpoint.ts`; `api.ts` with try/catch + `toApiError`, the NDJSON reader `streamReply` and the document calls. Uploads use `requestRaw` with no timeout, because embedding a long PDF on CPU can take longer than the client's default 60 s.
  - `api/hooks.ts` — conversations, detail, rename, delete, `useChatStream`, `useDocuments`, `useUploadDocument` (starts a chat first when none is open), `useDeleteDocument`.
  - `store/chat-stream-store.ts` — zustand: streaming text, its sources, the tool status ("Searching the web: …"), the abort controller.
  - `chat-page.tsx` — `MyUiSidebarLayout` with the chat list.
- `src/components/`:
  - `chat-composer.tsx` — `useAppForm` form with the `+` button (`upload-document-button.tsx`, file picker for `.txt`, `.md`, `.pdf`) and the chat's documents above it (`documents-panel.tsx`, removable badges).
  - `message-list.tsx` (`MyUiMessage`), with `source-list.tsx` under replies: numbered badges matching the `[1]`, `[2]` citations; hovering shows the excerpt.
  - `markdown-content.tsx` (`react-markdown` + GFM), `empty-chat.tsx`, `conversation-menu.tsx`, `rename-conversation-dialog.tsx`.

## State

- React Query holds the conversation list, each conversation's messages and each conversation's documents; stream events and mutations update those caches directly.
- The live reply, its sources and the tool status live in the zustand store, shared by the composer, the message list and the page.
