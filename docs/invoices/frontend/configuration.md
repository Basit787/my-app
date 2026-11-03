# Invoices UI — configuration

- `API_PROXY_TARGET` — where Vite proxies `/api` (Docker: `http://invoice-backend:3013`)
- `AUTH_PROXY_TARGET` — where Vite proxies `/auth-api`
- `VITE_API_URL`, `VITE_AUTH_URL` — optional overrides of the proxied paths
- Port `3014` comes from `packages/ports`; the upload limit shown in the UI is `src/lib/max-file-size.ts` (keep it equal to the backend's `MAX_FILE_SIZE_MB`).
