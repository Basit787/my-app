# Chatbot UI — architecture

React + Vite + TanStack Router app on port `3009`; API at `/api` (chatbot backend), auth at `/auth-api`.

## Layout

- `src/routes/` — `__root.tsx` (`AppProviders` from `frontend-common`), `index.tsx` (`AuthGate` → `ChatPage`; `?c=<conversationId>` selects the chat).
- `src/features/chat/` — `api/` (`endpoint.ts`, `api.ts` with try/catch + `toApiError` and the NDJSON reader `streamReply`, `hooks.ts`: conversations, detail, rename, delete, `useChatStream`), `store/chat-stream-store.ts` (zustand: streaming text + abort controller), `chat-page.tsx` (`MyUiSidebarLayout` with the chat list).
- `src/components/` — `message-list.tsx` (`MyUiMessage`), `markdown-content.tsx` (`react-markdown` + GFM), `chat-composer.tsx` (`useAppForm` form; sends and stops through `useChatStream`), `empty-chat.tsx` (suggestions), `conversation-menu.tsx`, `rename-conversation-dialog.tsx`.

## State

- React Query holds the conversation list and each conversation's messages; stream events update those caches directly.
- The live reply lives in the zustand store, shared by the composer, the message list and the page.
