# Link shortener API — flows

## Creating a link

```mermaid
sequenceDiagram
    participant UI as Links page
    participant C as LinksController
    participant S as LinksService
    participant DB as PostgreSQL
    UI->>C: POST /links { url, slug?, title?, expiresAt? } + bearer token
    C->>C: AuthGuard, validation pipe (CreateLinkDto)
    C->>S: create(userId, body)
    S->>DB: check or generate a free slug, insert
    C-->>UI: 201 Link (409 when the slug is taken)
```

## Following a short link

```mermaid
sequenceDiagram
    participant V as Visitor
    participant F as Frontend :3004 (Vite proxy)
    participant R as ShortLinksController
    participant S as LinksService
    participant DB as PostgreSQL
    V->>F: GET /r/abc123
    F->>R: GET /r/abc123
    R->>S: resolve(slug, referer, user agent)
    S->>DB: find link, record one click, increment click_count
    R-->>V: 302 to the target URL (404 when missing or expired)
```

## Stats

- `GET /links/:id/stats` counts the link's clicks per day for the last 30 days, filling days without clicks with `0`; the frontend shows them in a chart dialog.
