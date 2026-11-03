# Documentation

Docs for every app in the workspace. Start with [getting started](getting-started.md), then the app you work on.

## Workspace

- [Getting started](getting-started.md) — run the stack, URLs, demo accounts
- [Infrastructure](infrastructure.md) — Docker layout, shared services, memory
- [Shared packages](shared-packages.md) — `my-ui`, `frontend-common`, `backend-common`, `ports`, config packages

## Apps

- Auth — [architecture](auth/architecture.md), [flow](auth/flow.md), [API](auth/api.md), [data model](auth/data-model.md), [configuration](auth/configuration.md)
- Home — [architecture](home/architecture.md), [flow](home/flow.md), [configuration](home/configuration.md)
- Link shortener
  - Backend — [architecture](link-shortener/backend/architecture.md), [flow](link-shortener/backend/flow.md), [API](link-shortener/backend/api.md), [data model](link-shortener/backend/data-model.md), [configuration](link-shortener/backend/configuration.md)
  - Frontend — [architecture](link-shortener/frontend/architecture.md), [flow](link-shortener/frontend/flow.md), [configuration](link-shortener/frontend/configuration.md)
- Image upload
  - Backend — [architecture](image-upload/backend/architecture.md), [flow](image-upload/backend/flow.md), [API](image-upload/backend/api.md), [data model](image-upload/backend/data-model.md), [configuration](image-upload/backend/configuration.md)
  - Frontend — [architecture](image-upload/frontend/architecture.md), [flow](image-upload/frontend/flow.md), [configuration](image-upload/frontend/configuration.md)
- AI summary
  - Backend — [architecture](ai-summary/backend/architecture.md), [flow](ai-summary/backend/flow.md), [API](ai-summary/backend/api.md), [data model](ai-summary/backend/data-model.md), [configuration](ai-summary/backend/configuration.md)
  - Frontend — [architecture](ai-summary/frontend/architecture.md), [flow](ai-summary/frontend/flow.md), [configuration](ai-summary/frontend/configuration.md)
- Chatbot
  - Backend — [architecture](chatbot/backend/architecture.md), [flow](chatbot/backend/flow.md), [API](chatbot/backend/api.md), [data model](chatbot/backend/data-model.md), [configuration](chatbot/backend/configuration.md)
  - Frontend — [architecture](chatbot/frontend/architecture.md), [flow](chatbot/frontend/flow.md), [configuration](chatbot/frontend/configuration.md)
- Invoices
  - Backend — [architecture](invoices/backend/architecture.md), [flow](invoices/backend/flow.md), [API](invoices/backend/api.md), [data model](invoices/backend/data-model.md), [configuration](invoices/backend/configuration.md)
  - Frontend — [architecture](invoices/frontend/architecture.md), [flow](invoices/frontend/flow.md), [configuration](invoices/frontend/configuration.md)

## Adding docs

Each app folder can hold more files than the ones above (for example `deployment.md`, `troubleshooting.md`, `decisions.md`); add them to this index.
