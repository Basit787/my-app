# Chatbot API — data model

PostgreSQL database `chatbot`.

## `conversations` (Prisma, schema `public`)

- `id` (uuid), `user_id`, `title` (default `New chat`), `created_at`, `updated_at`; index `(user_id, updated_at)`
- Schema `libs/db/prisma/schema.prisma`, migrations `libs/db/prisma/migrations/` (applied by `prisma migrate deploy` on start).

## Messages (LangGraph `PostgresSaver`, schema `langgraph`)

- Tables `checkpoints`, `checkpoint_blobs`, `checkpoint_writes`, `checkpoint_migrations`, created by `setup()` at startup.
- One thread per conversation (`thread_id` = conversation id); the thread state is the list of LangChain messages (human / AI). Deleting a conversation deletes its thread.
