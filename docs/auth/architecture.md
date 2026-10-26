# Auth service — architecture

NestJS service on port `3001` (global prefix `/api`, Swagger at `/api/docs`) that owns sign-in for every app. Built on better-auth with MongoDB.

## Modules

- `src/auth` — better-auth instance (`AUTH`), passthrough `AuthController` for `/api/auth/*` (sign-in, sign-up, sessions), `AuthService`, `SessionGuard`, `@CurrentSession()`, `AdminSeeder` (creates `admin@chat.local` on start).
- `src/session` — `GET /api/session`, `POST /api/token` (access token + refresh-token rotation), `POST /api/logout`; `SessionService` issues tokens, `RefreshTokenService` keeps hashed rotating refresh tokens in an httpOnly cookie.
- `src/keys` — EdDSA signing key stored in Mongo `signingkeys`, published at `GET /.well-known/jwks.json` (outside `/api`).
- `src/account` — `POST|DELETE /api/account/avatar` (MinIO `avatars/<userId>`), public `GET /api/avatars/:userId`.
- `libs/common` — config, `StorageService`, re-exports of `ApiExceptionFilter`, `httpValidationPipe` and CORS helpers from `backend-common`; `libs/db` — repositories for keys, refresh tokens and users.
- `AppModule` registers `ApiExceptionFilter` and `RequestLoggerMiddleware`.

## Data

- MongoDB: better-auth's `user`, `session`, `account`, `verification`, plus `signingkeys` and refresh tokens.
- MinIO: profile photos.

## Tokens

- Access token: EdDSA JWT with `sub`, `name`, `email`, `role`, `picture`; issuer `AUTH_PUBLIC_URL`, audience `AUTH_AUDIENCE`, 15 minutes.
- Every API verifies it with `createAccessTokenVerifier` from `backend-common/auth` against `/.well-known/jwks.json`.
- Sessions: a cookie through each app's `/auth-api` proxy (first-party, shared across ports on one host) or a bearer session token (`set-auth-token`) for clients without cookies.
