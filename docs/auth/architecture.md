# Auth service — architecture

NestJS 12 service on port `3001` (global prefix `/api`, Swagger at `/docs`) that owns sign-in for every app. Users live in PostgreSQL through Prisma; profile photos in S3.

## Layout

- `src/auth/` — `AuthController` (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, rate-limited to 10 requests a minute per client by `ThrottlerGuard`), `AuthService` (register, login, `me`, token signing), DTOs, `utils/` (scrypt `hashPassword` / `verifyPassword`, `toAuthUserDto`).
- `src/account/` — `AccountController` (`POST|DELETE /api/account/avatar`, `DELETE /api/account`, public `GET /api/avatars/:userId`), `AccountService` (photo upload and removal, account deletion after a password check).
- `libs/common` (`@app/common`) — `appConfig` and re-exports of the shared Nest pieces from `backend-common`.
- `libs/db` (`@app/db`) — `PrismaService` and `UserRepository`; schema and migrations in `prisma/`.
- `AppModule` imports `JwtAuthModule` (global `AuthGuard`), `ObjectStorageModule` (bucket `auth`), registers `ApiExceptionFilter` and `RequestLoggerMiddleware`.

## Tokens

- Register and login return `{ user, token, expiresAt }`. The token is an HS256 JWT signed with `JWT_SECRET` (`signAccessToken` in `backend-common`), with claims `sub` (user id), `name`, `email`, `role`; it lives `JWT_TTL_SECONDS` (default 24 h). There is no refresh token: when it expires the user signs in again.
- Every backend verifies the token locally with `verifyAccessToken` and the same `JWT_SECRET`; none of them calls the auth service per request.
- The web apps keep the token in the `access_token` cookie (written by `createAuthClient` in `frontend-common`), so every app on the same host shares one sign-in.

## Passwords

- Stored as `scrypt:<salt>:<hash>` with a random 16-byte salt per password.
- An unknown email is hashed anyway before the 401, so it answers as slowly as a wrong password.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
