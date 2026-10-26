# Chatbot API — endpoints

Base URL `http://localhost:3010` (the UI calls `/api/...`); Swagger at `/docs`. Every route except `/health` needs a bearer access token and only sees the caller's conversations. Errors are `{ error, details? }`.

- `GET /conversations` → `{ conversations: Conversation[] }` (most recently active first)
- `POST /conversations` → `201 Conversation` (title `New chat`)
- `GET /conversations/:id` → `{ conversation, messages: { id, role: "user" | "assistant", content }[] }`
- `PATCH /conversations/:id` `{ title }` (1–200 characters) → `Conversation`
- `DELETE /conversations/:id` → `{ ok: true }` (also deletes the LangGraph thread)
- `POST /conversations/:id/messages` `{ content }` (1–8000 characters) → `200 application/x-ndjson`, one JSON event per line:
  - `{ "type": "conversation", "conversation": Conversation }` — first message only, with the new title
  - `{ "type": "delta", "text": "…" }` — reply text as it is generated
  - `{ "type": "done", "message": ChatMessage, "conversation": Conversation }` — the saved reply
  - `{ "type": "error", "error": "The model could not answer: …" }`
- `GET /health` → `{ ok: true }`

`Conversation`: `{ id, title, createdAt, updatedAt }`.
