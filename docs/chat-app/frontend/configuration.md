# Chat UI — configuration

Only `VITE_*` variables reach the browser; the rest configure the Vite dev/preview server.

- `API_PROXY_TARGET` — where `/api` and `/socket.io` are proxied (chat API; Docker: `http://chat-app-backend:3002`)
- `AUTH_PROXY_TARGET` — where `/auth-api` is proxied (auth service)
- `VITE_API_URL`, `VITE_AUTH_URL`, `VITE_SOCKET_URL` — optional overrides of the proxied paths
- `DEV_HTTPS=true` — self-signed HTTPS for testing calls from phones on the LAN
- Port `3003` comes from `packages/ports`.
