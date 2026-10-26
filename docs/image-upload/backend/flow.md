# Image upload API — flows

## Upload (now or scheduled)

```mermaid
sequenceDiagram
    participant UI as Gallery
    participant C as image.controller
    participant M as MinIO
    participant DB as PostgreSQL
    participant Q as publish-image queue
    UI->>C: POST /images (file, scheduledAt?)
    C->>M: store bytes
    C->>DB: image row (active, or scheduled)
    opt scheduledAt set
        C->>Q: delayed job at scheduledAt
        Q->>DB: status = active when due
    end
    C-->>UI: 201 ImageDto
```

## Bin

1. `DELETE /images/:id` sets `deletedAt`; the image moves to the bin.
2. `POST /images/:id/restore` clears it; `DELETE /images/:id/permanent` removes the row and the MinIO object.
3. The `purge-bin` job deletes everything binned longer than the retention period.
