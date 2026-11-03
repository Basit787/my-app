# Link shortener UI — configuration

- `API_PROXY_TARGET` — where Vite proxies `/api` and `/r` (Docker: `http://link-shortener-backend:3012`)
- `AUTH_PROXY_TARGET` — where Vite proxies `/auth-api`
- `VITE_API_URL`, `VITE_AUTH_URL` — optional overrides of the proxied paths
- Port `3004` comes from `packages/ports`.
