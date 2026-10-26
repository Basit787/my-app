# AI summary UI — flows

1. The page loads `/api/documents` and opens `/api/events` (fetch stream with the bearer token, parsed with `readStreamParts`).
2. Uploading a `.txt` posts it to `/api/documents/upload`; the row appears as Queued.
3. Events move the row to Summarizing and then Summarized (toast "Summary ready") or Failed (Summarize again in the row menu).
4. If the stream drops, the hook reconnects after 3 s and refetches the list once to catch anything missed.
