# Chatbot API — architecture

NestJS 12 service on port `3010` (Swagger at `/docs`): a ChatGPT-style chatbot on the local Ollama model, built with LangChain and LangGraph. It answers from documents uploaded to a conversation (RAG) and can search the web (tool calling).

## Libraries (`libs/`, `@app/<name>`)

- `@app/common` — `appConfig` (port, database URLs, CORS, upload limit, S3, Ollama chat and embedding models, SearXNG URL); re-exports the shared Nest pieces from `backend-common`.
- `@app/db` — Prisma: `PrismaService`, `ConversationRepository`, `DocumentRepository`.
- `@app/storage` — `StorageCoreModule`, the shared S3 module from `backend-common` on the `chatbot` bucket (uploaded files; Postgres keeps only the key).
- `@app/agent` — `ChatGraphService`, the only service of the library:
  - LangGraph graph `START → retrieve → model → (tools → model)* → END`, compiled with `PostgresSaver` (schema `langgraph`, thread id = conversation id).
  - `retrieve` skips everything when the conversation has no documents (no embedding call); otherwise it embeds the question and takes the 4 closest chunks of this conversation from pgvector.
  - `model` is `ChatOpenAI` at `{OLLAMA_URL}/v1` with the `web_search` tool bound. Its system prompt (`buildSystemPrompt`) adds the numbered excerpts so the answer can cite `[1]`, `[2]`. The excerpts are saved on the written reply (`additional_kwargs.sources`).
  - `tools` is LangGraph's `ToolNode`. `web_search` calls SearXNG and returns the top 5 results as text; a failed search comes back as text too, so the model can still answer.
  - Document chunks: `RecursiveCharacterTextSplitter` (1000 characters, overlap 150), `OpenAIEmbeddings` at `{OLLAMA_URL}/v1` with `encodingFormat: "float"` (Ollama does not return the SDK's default base64), `PGVectorStore` on `VECTOR_DATABASE_URL`, table `document_chunks`. On start it creates the vector database when missing (`ensureDatabase`) and the `vector` extension and table.

## Features

- `src/conversations/` — conversations and the NDJSON reply stream; deleting a conversation also deletes its chunks, its S3 files and its thread.
- `src/documents/` — upload, list and delete a conversation's documents. Text comes from `.txt`/`.md` as UTF-8 and from `.pdf` through Poppler's `pdftotext` (`runCommand` from `backend-common`; no OCR, so scanned PDFs are refused). The file is chunked and embedded inside the request, so it can be asked about as soon as the upload returns. If embedding fails, its chunks and file are removed and the reply is `502` with Ollama's message.

## Model context

- History sent to the model is trimmed to a character budget: 16k characters, or 10k when excerpts are added. `historyForModel` drops earlier turns' tool calls and tool results and keeps the current turn's, so a tool result is never sent without the call it answers.
- One message runs at most 12 graph steps (`recursionLimit`), so a small model cannot loop on tool calls.
- Small models (the default `qwen2.5:0.5b`) call tools unreliably; `qwen2.5:1.5b` or larger works better.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
