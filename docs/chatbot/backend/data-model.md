# Chatbot API — data model

## PostgreSQL database `chatbot` (`postgres`)

### `conversations` (Prisma, schema `public`)

- `id` (uuid), `user_id`, `title` (default `New chat`), `created_at`, `updated_at`; index `(user_id, updated_at)`

### `documents` (Prisma, schema `public`)

- `id` (uuid), `conversation_id` (FK, cascade delete), `file_name`, `content_type`, `size`, `object_key` (S3 key `documents/<conversationId>/<uuid>.<ext>`), `chunk_count`, `created_at`; index `conversation_id`

Schema `prisma/schema.prisma`, migrations `prisma/migrations/` (applied by `prisma migrate deploy` on start).

### Messages (LangGraph `PostgresSaver`, schema `langgraph`)

- Tables created by `setup()` at startup; one thread per conversation (`thread_id` = conversation id).
- Thread state: the LangChain messages (human, AI, AI tool calls, tool results) and `sources`, the excerpts retrieved for the latest question (`null` when the chat has no documents). Written replies keep their excerpts in `additional_kwargs.sources`.

## pgvector database `chatbot` (`vectordb`)

- `document_chunks` (created by `PGVectorStore`): `id` (uuid), `content` (chunk text), `metadata` (jsonb `{ conversationId, documentId, fileName, chunkIndex }`), `embedding` (`vector`). Search and delete filter on the metadata.
