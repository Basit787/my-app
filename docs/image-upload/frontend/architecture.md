# Image upload UI — architecture

React + Vite + TanStack Router gallery on port `3005`; API at `/api` (image upload backend), auth at `/auth-api`.

## Layout

- `src/routes/` — `__root.tsx` (`AppProviders` from `frontend-common`), `_app.tsx` (`AuthGate` + `AppShell`), `_app/index.tsx` (gallery), `_app/scheduled.tsx`, `_app/bin.tsx`.
- `src/features/images/` — `api/` (`endpoint.ts`, `api.ts` with try/catch + `toApiError`, `hooks.ts`), `gallery-view.tsx`, `scheduled-view.tsx`, `bin-view.tsx`.
- `src/components/` — `app-shell.tsx` (`MyUiSidebarLayout` + mobile bottom nav), `image-grid.tsx`, `image-card.tsx`, `image-preview-dialog.tsx`, `upload-dialog.tsx`, `upload-dropzone.tsx`, `upload-fab.tsx`.
- `src/lib/` — auth, API and query clients from `frontend-common`, view list, per-view counts.

## Data

- Every list, bin page and count lives under the `images` React Query key, so one invalidation refreshes them all; image bytes are fetched with the access token and shown as object URLs.
