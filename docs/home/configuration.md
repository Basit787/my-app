# Home — configuration

- `AUTH_PROXY_TARGET` — where Vite proxies `/auth-api`
- `VITE_AUTH_URL` — optional override of `/auth-api`
- `VITE_CHAT_APP_URL` — optional chat link override; app URLs otherwise come from `serviceUrl` in `packages/ports`
- Port `3000` comes from `packages/ports`; app cards are listed in `src/lib/apps.ts`.
