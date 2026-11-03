# Chatbot API — endpoints

Base URL `http://localhost:3010` (the UI calls `/api/...` on its own port); Swagger at `/docs`. Every route needs a bearer access token and only sees the caller's conversations. Errors are `{ error, details? }`.

## Conversations

- `GET /conversations` → `{ conversations: Conversation[] }` (most recently active first)
- `POST /conversations` → `201 Conversation` (title `New chat`)
- `GET /conversations/:id` → `{ conversation, messages: ChatMessage[] }`; tool calls and tool results are not listed
- `PATCH /conversations/:id` `{ title }` (1–200 characters) → `Conversation`
- `DELETE /conversations/:id` → `{ ok: true }` (also deletes the thread, the document chunks and files)
- `POST /conversations/:id/messages` `{ content }` (1–8000 characters) → `200 application/x-ndjson`, one JSON event per line:
  - `{ "type": "conversation", "conversation": Conversation }` — first message only, with the new title
  - `{ "type": "sources", "sources": Source[] }` — chats with documents: the excerpts the answer will use
  - `{ "type": "tool", "name": "web_search", "input": "…" }` — each tool the model calls
  - `{ "type": "delta", "text": "…" }` — reply text as it is generated
  - `{ "type": "done", "message": ChatMessage, "conversation": Conversation }` — the saved reply
  - `{ "type": "error", "error": "The model could not answer: …" }`

## Documents

- `GET /conversations/:id/documents` → `{ documents: Document[] }` (upload order)
- `POST /conversations/:id/documents` (multipart `file`: `.txt`, `.md` or `.pdf`, up to `MAX_FILE_SIZE_MB`) → `201 Document` once the file is chunked and embedded; `400` for another type, a larger file or no text, `502` when embedding fails
- `DELETE /conversations/:id/documents/:documentId` → `{ ok: true }`

## Types

- `Conversation`: `{ id, title, createdAt, updatedAt }`
- `ChatMessage`: `{ id, role: "user" | "assistant", content, sources?: Source[] }`
- `Source`: `{ documentId, fileName, excerpt }`
- `Document`: `{ id, fileName, contentType, size, chunkCount, createdAt }`

Example calls: `apps/chatbot-backend/examples/requests.http`, with sample files in `examples/documents/`.
