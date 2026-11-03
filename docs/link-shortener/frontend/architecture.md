# Link shortener UI — architecture

React + Vite + TanStack Router app on port `3004`; API at `/api` (link shortener backend), short links at `/r/*` (proxied to the backend unchanged), auth at `/auth-api`.

## Layout

- `src/routes/` — `__root.tsx` (`AppProviders` from `frontend-common`), `index.tsx` (`AuthGate` → `LinksPage`).
- `src/features/links/`:
  - `api/` — `endpoint.ts`, `api.ts` (try/catch + `toApiError`), `hooks.ts` (list, create, delete, stats with TanStack Query).
  - `links-page.tsx` — `MyUiTabs` "Create link" / "Links" on desktop, `MobileBottomNav` on phones.
  - `validation/` — zod schemas for the create form (`url`, optional `slug`), `utils/` — `shortUrl` (page origin + `shortPath`), `isLinkExpired`.
- `src/components/`:
  - `create-link-form.tsx` — `useAppForm` form; switches to the Links tab once created.
  - `links-table.tsx` — `MyUiDataTable`: short link, destination, clicks, created; row actions copy, open, click stats, delete (with `confirm`); bulk copy and delete; Refresh.
  - `link-stats-dialog.tsx` — 30-day clicks chart (`MyUiChart`).
