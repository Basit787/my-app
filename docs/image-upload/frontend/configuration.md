# Image upload UI — configuration

- `API_PROXY_TARGET` — where Vite proxies `/api` (Docker: `http://image-upload-backend:3006`)
- `AUTH_PROXY_TARGET` — where Vite proxies `/auth-api`
- `VITE_API_URL`, `VITE_AUTH_URL` — optional overrides of the proxied paths
- Port `3005` comes from `packages/ports`.
