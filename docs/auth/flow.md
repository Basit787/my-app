# Auth service — flows

## Sign-in and first token

```mermaid
sequenceDiagram
    participant UI as Any web app
    participant P as App proxy /auth-api
    participant Auth as Auth service
    participant DB as MongoDB
    UI->>P: POST /auth-api/auth/sign-in/email
    P->>Auth: /api/auth/sign-in/email
    Auth->>DB: check credentials, create session
    Auth-->>UI: session cookie
    UI->>Auth: POST /api/token (cookie)
    Auth->>DB: start the refresh-token chain
    Auth-->>UI: accessToken + refresh cookie
```

## Calling another API

```mermaid
sequenceDiagram
    participant UI as Web app
    participant API as App backend
    participant Auth as Auth service
    UI->>API: request with Authorization: Bearer <accessToken>
    API->>Auth: GET /.well-known/jwks.json (cached)
    API->>API: verify signature, issuer, audience, expiry
    API-->>UI: data, or 401 { error }
```

## Renewal and sign-out

1. Before the access token expires the client calls `POST /api/token`; the refresh cookie is rotated (a just-replaced token stays valid briefly for parallel tabs).
2. A missing or reused refresh token ends the session and clears both cookies (401).
3. `POST /api/logout` deletes the refresh token and the session and clears the cookies.
