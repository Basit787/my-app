# Chatbot UI — configuration

- `API_PROXY_TARGET` — where Vite proxies `/api` (Docker: `http://chatbot-backend:3010`)
- `AUTH_PROXY_TARGET` — where Vite proxies `/auth-api`
- `VITE_API_URL`, `VITE_AUTH_URL` — optional overrides of the proxied paths
- Port `3009` comes from `packages/ports`.
