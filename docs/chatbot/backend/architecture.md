# Chatbot API — architecture

NestJS 12 service on port `3010` (Swagger at `/docs`): a ChatGPT-style chatbot on the local Ollama model, built with LangChain and LangGraph.

## Libraries (`libs/`, `@app/<name>`)

- `@app/common` — `appConfig` (port, database URL, auth, CORS, `ollama.url` / `ollama.model`); re-exports `Public`, `CurrentUser`, `ApiExceptionFilter`, `httpValidationPipe`, `OkResponseDto` from `backend-common/nest`.
- `@app/auth` — `AuthCoreModule` = `AccessTokenModule.forRoot(appConfig.auth)`: global `AuthGuard` + `AuthService`.
- `@app/db` — Prisma 7: schema and migrations in `libs/db/prisma/`, client generated to `libs/db/src/generated`, `PrismaService`, `ConversationRepository`.
- `@app/agent` — `ChatGraphService`: a LangGraph `StateGraph(MessagesAnnotation)` (START → model → END) compiled with a `PostgresSaver` checkpointer; the model is `ChatOpenAI` pointed at `{OLLAMA_URL}/v1`; history sent to the model is trimmed to a character budget.

## Feature

- `src/conversations/` — controller, service, DTOs, stream event type, utils (`toConversationDto`, `toChatMessageDto`, `titleFromMessage`).

## Data

- PostgreSQL database `chatbot`: table `conversations` (Prisma: id, owner, title, timestamps) and schema `langgraph` (checkpoint tables created by `PostgresSaver.setup()`), with thread id = conversation id.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
