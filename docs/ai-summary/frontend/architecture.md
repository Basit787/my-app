# AI summary UI — architecture

React + Vite + TanStack Router app on port `3007`; API at `/api` (AI summary backend), auth at `/auth-api`.

## Layout

- `src/routes/` — `__root.tsx` (`AppProviders` from `frontend-common`), `index.tsx` (`AuthGate` → `DocumentsPage`).
- `src/features/documents/` — `api/` (`endpoint.ts`, `api.ts` with try/catch + `toApiError` and the SSE reader `streamDocumentEvents`, `hooks.ts`), `documents-page.tsx`.
- `src/components/` — `documents-table.tsx` (`MyUiDataTable` with typed `columns` and `singleRowActions`), `document-status-badge.tsx`, `upload-document-dialog.tsx`, `view-document-dialog.tsx`.

## State

- One React Query cache (`documents`); `useDocumentEvents` keeps an authenticated SSE connection open and writes every `document.updated` / `document.deleted` event into that cache. No polling.
