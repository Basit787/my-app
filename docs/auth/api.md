# Auth service — API

Base URL `http://localhost:3001`; apps call it as `/auth-api/...` (their proxy rewrites to `/api/...`). Errors are `{ error, details? }`.

## better-auth (`/api/auth/*`)

- `POST /api/auth/sign-up/email` `{ name, email, password }`
- `POST /api/auth/sign-in/email` `{ email, password }` → session cookie (and `set-auth-token` header for bearer sessions)
- `POST /api/auth/sign-out`, `GET /api/auth/get-session`, plus better-auth's account routes (documented by hand in `src/swagger.ts`)

## Session and tokens

- `GET /api/session` → `{ authenticated, user: { id, name, email, image, role } | null }`
- `POST /api/token` (session required) → `{ accessToken, expiresAt, user }`; rotates the refresh-token cookie; 401 when the session ended
- `POST /api/logout` → `{ ok: true }`; deletes the session and the refresh token, clears cookies

## Keys

- `GET /.well-known/jwks.json` → the public EdDSA key(s) every API uses to verify access tokens

## Account

- `POST /api/account/avatar` (multipart `file`) → updated user image
- `DELETE /api/account/avatar` → `{ ok: true }`
- Public `GET /api/avatars/:userId` → image bytes

Swagger: `http://localhost:3001/api/docs`.
