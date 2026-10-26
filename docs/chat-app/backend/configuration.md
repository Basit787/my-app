# Chat API — configuration

Read once at startup by `libs/common/src/config/app.config.ts`. In Docker the compose file sets most values; `.env` (from `.env.example`) overrides them.

- `PORT` — default `3002`
- `MONGODB_URI` — default `mongodb://127.0.0.1:27018/realtime_chat`
- `AUTH_JWKS_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE` — where and how access tokens are verified (defaults: the local auth service, audience `chatwave`)
- `CORS_ORIGIN` — comma-separated allowed origins; `ALLOW_LAN_ORIGINS` — also allow any private-network origin (dev default `true`); `MOBILE_APP_ORIGIN`
- `MINIO_ENDPOINT` (required), `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` (`chat-uploads`), `MINIO_REGION`; compose maps `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`
- `MAX_FILE_SIZE_MB` — upload limit, default `25`
- `TURN_HOST`, `TURN_PORT`, `TURN_USER`, `TURN_PASSWORD`, `TURN_EXTERNAL_IP` — coturn for WebRTC
