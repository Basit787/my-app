# AI summary API — architecture

NestJS 12 service on port `3008` (Swagger at `/docs`). Stores uploaded `.txt` files, summarizes them with the local Ollama model in the background and pushes status changes to the browser over Server-Sent Events.

## Layout

- `src/documents/` — `DocumentsController` (`/documents`), `DocumentsService` (upload, list, get, retry, delete, the background summary and `resumePending`), DTOs, `types/document-event.ts`, `utils/` (`readText`, `toDocumentDto`).
- `src/events/` — `EventsController` (`GET /events`) and `EventsService`: one `PassThrough` stream per open page, returned as a `StreamableFile` (`text/event-stream`), fed from the user's Redis channel, with a `: ping` every 15 s.
- `src/main.ts` — after listening, calls `DocumentsService.resumePending()` so documents left `UPLOADED` or `PROCESSING` by a restart are summarized again.

## Libraries (`libs/`, `@app/<name>`)

- `@app/common` — `appConfig` and re-exports from `backend-common`.
- `@app/db` — `PrismaService`, `DocumentRepository`; schema, migrations and `seed.mjs` in `prisma/`.
- `@app/storage` — the shared S3 module on bucket `ai-summaries`.
- `@app/events` — `EventBrokerService`: Redis pub/sub on `ai-summary:events:<userId>`, so jobs and streams can run in different processes. Startup fails with a clear error when Redis is unreachable.
- `@app/llm` — `SummaryModelService`: LangChain `ChatOpenAI` at `{OLLAMA_URL}/v1` (`apiKey` ignored by Ollama). Text up to 12,000 characters is summarized in one call; longer text in 12k-character parts whose summaries are combined (again in parts when needed). Errors carry Ollama's own message.

## Background work

- A summary starts in the background right after the upload (or retry) reply; resumed documents run one after another. Each step is logged with the document id.
- A failure never throws out of the job: the document becomes `FAILED` and the cause is logged.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
