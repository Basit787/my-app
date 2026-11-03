# Auth service — API

Base URL `http://localhost:3001/api`; web apps call it as `/auth-api/...` (their Vite proxy rewrites to `/api/...`). Swagger at `http://localhost:3001/docs`. Errors are `{ error, details? }`; validation failures are `400 { error: "Invalid request", details }`.

## Sign-in (`/api/auth`, 10 requests a minute per client)

- Public `POST /api/auth/register` `{ name, email, password }` → `201 SignInReply`; `name` is 2–32 letters, digits, `-` or `_`, `password` 8–128 characters; `409` when the email or name is taken
- Public `POST /api/auth/login` `{ email, password }` → `200 SignInReply`; `401` for a wrong email or password
- `GET /api/auth/me` → `AuthUser`; `401` when the account no longer exists

## Account

- `POST /api/account/avatar` (multipart `photo`, an image up to 5 MB) → `AuthUser` with the new `image`
- `DELETE /api/account/avatar` → `AuthUser`
- `DELETE /api/account` `{ password }` → `{ ok: true }`; deletes the user and the photo; `401` for a wrong password
- Public `GET /api/avatars/:userId` → image bytes; `404` when there is none

## Types

- `SignInReply`: `{ user: AuthUser, token, expiresAt }` (`expiresAt` in epoch milliseconds)
- `AuthUser`: `{ id, name, email, role: "user" | "admin", image }`; `image` is `/avatars/<id>?v=<updatedAt>` relative to the API, or `""`

Every other route needs `Authorization: Bearer <token>`.
