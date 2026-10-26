# AI summary API — flows

## Upload to summary

```mermaid
sequenceDiagram
    participant UI as Documents page
    participant R as documents route
    participant M as MinIO
    participant DB as PostgreSQL
    participant J as summarizer (background)
    participant L as Ollama
    participant E as Redis
    UI->>R: POST /documents/upload (.txt, ≤1 MB)
    R->>M: store text
    R->>DB: document UPLOADED
    R->>E: document.updated
    R-->>UI: 201 document
    R->>J: summarize_document(id)
    J->>DB: PROCESSING
    J->>E: document.updated
    J->>M: download text
    J->>L: summarize (12k-character parts, then combine)
    J->>DB: COMPLETED + summary (or FAILED)
    J->>E: document.updated
```

## Live updates

```mermaid
sequenceDiagram
    participant UI as Browser
    participant S as GET /events
    participant E as Redis
    UI->>S: open stream (bearer token)
    S->>E: SUBSCRIBE ai-summary:events:<userId>
    E-->>S: document.updated / document.deleted
    S-->>UI: data: {...} (keep-alive ping every 15 s)
```

## Restarts and failures

- Documents left UPLOADED or PROCESSING are resumed at startup.
- A failed summary keeps status FAILED and logs the cause (Ollama's own message); `POST /documents/{id}/summarize` retries it.
