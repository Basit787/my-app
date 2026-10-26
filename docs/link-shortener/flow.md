# Link shortener — flows

## Creating a link

```mermaid
sequenceDiagram
    participant UI as Dashboard
    participant H as POST /api/links
    participant S as linkService
    participant DB as PostgreSQL
    UI->>H: { url, slug?, title?, expiresAt? } + bearer token
    H->>H: requireUser, parseBody (zod)
    H->>S: create(userId, input)
    S->>DB: insert with a unique slug
    H-->>UI: 201 LinkDto
```

## Following a short link

```mermaid
sequenceDiagram
    participant V as Visitor
    participant R as GET /r/:slug
    participant S as linkService
    participant DB as PostgreSQL
    V->>R: /r/abc123
    R->>S: resolve(slug, referer, user agent)
    S->>DB: find link, record one click
    R-->>V: 302 to the target URL (404 when missing or expired)
```

## Stats

- `GET /api/links/:id/stats` returns clicks per day for the last 30 days; the dashboard shows them in a chart dialog.
