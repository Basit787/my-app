# Auth service — flows

## Sign-in

```mermaid
sequenceDiagram
    participant UI as Any web app
    participant P as Vite proxy /auth-api
    participant Auth as Auth service
    participant DB as PostgreSQL
    UI->>P: POST /auth-api/auth/login { email, password }
    P->>Auth: POST /api/auth/login
    Auth->>DB: find the user, verify the scrypt hash
    Auth-->>UI: { user, token, expiresAt }
    UI->>UI: save token in the access_token cookie
```

Register is the same call on `/auth/register`, after checking that the email and name are free.

## Calling another API

```mermaid
sequenceDiagram
    participant UI as Web app
    participant API as App backend
    UI->>API: request with Authorization: Bearer <token>
    API->>API: AuthGuard: verify HS256 signature (JWT_SECRET) and expiry
    API-->>UI: data, or 401 { error }
```

## Restoring and ending a session

1. On load, `AuthGate` reads the `access_token` cookie and calls `GET /api/auth/me`; a 401 (expired token or deleted account) clears the cookie and shows `LoginScreen`.
2. A 401 from any app's API (`createAppApiClient`) signs out the same way, so an expired token leads back to the login screen.
3. Sign-out deletes the cookie; there is no server-side session to end, the token simply expires.
4. Deleting the account (`DELETE /api/account` with the password) removes the user and the photo, then signs out.
