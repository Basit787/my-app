# Home — architecture

React + Vite + TanStack Router launcher on port `3000`; the landing page of the workspace.

## Layout

- `src/routes/` — `__root.tsx` mounts `AppProviders` from `frontend-common`; `index.tsx` is `AuthGate` → `HomePage`; `privacy.tsx`, `terms.tsx`, `cookies.tsx` render the legal pages.
- `src/components/` — `home-page.tsx` (grid), `app-card.tsx`, `legal-page.tsx`.
- `src/lib/` — `apps.ts` (every app card: name, description, icon, URL from `serviceUrl`), `auth.ts`, `query-client.ts`, `warm-app.ts` (requests another app's dev server ahead of the click), legal texts.

## Dependencies

- Signs in through the auth service via the Vite `/auth-api` proxy; has no backend of its own.
- UI from `my-ui`; `AuthGate`, `UserMenu` and legal components from `frontend-common`.
