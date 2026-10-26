# Documentation

Docs for every app in the workspace. Start with [getting started](getting-started.md), then the app you work on.

## Workspace

- [Getting started](getting-started.md) — run the stack, URLs, seeded admin
- [Infrastructure](infrastructure.md) — Docker layout, shared services, memory
- [Kubernetes](../kubernetes/README.md) — Helm chart, ingress-nginx, CI/CD deploy
- [Shared packages](shared-packages.md) — `my-ui`, `frontend-common`, `backend-common`, `ports`, config packages

## Apps

- Auth — [architecture](auth/architecture.md), [flow](auth/flow.md), [API](auth/api.md), [data model](auth/data-model.md), [configuration](auth/configuration.md)
- Home — [architecture](home/architecture.md), [flow](home/flow.md), [configuration](home/configuration.md)
- Chat app
  - Backend — [architecture](chat-app/backend/architecture.md), [flow](chat-app/backend/flow.md), [API](chat-app/backend/api.md), [socket events](chat-app/backend/socket-events.md), [data model](chat-app/backend/data-model.md), [configuration](chat-app/backend/configuration.md)
  - Frontend — [architecture](chat-app/frontend/architecture.md), [flow](chat-app/frontend/flow.md), [configuration](chat-app/frontend/configuration.md)
- Link shortener — [architecture](link-shortener/architecture.md), [flow](link-shortener/flow.md), [API](link-shortener/api.md), [data model](link-shortener/data-model.md), [configuration](link-shortener/configuration.md)
- Image upload
  - Backend — [architecture](image-upload/backend/architecture.md), [flow](image-upload/backend/flow.md), [API](image-upload/backend/api.md), [data model](image-upload/backend/data-model.md), [configuration](image-upload/backend/configuration.md)
  - Frontend — [architecture](image-upload/frontend/architecture.md), [flow](image-upload/frontend/flow.md), [configuration](image-upload/frontend/configuration.md)
- AI summary
  - Backend — [architecture](ai-summary/backend/architecture.md), [flow](ai-summary/backend/flow.md), [API](ai-summary/backend/api.md), [data model](ai-summary/backend/data-model.md), [configuration](ai-summary/backend/configuration.md)
  - Frontend — [architecture](ai-summary/frontend/architecture.md), [flow](ai-summary/frontend/flow.md), [configuration](ai-summary/frontend/configuration.md)
- Chatbot
  - Backend — [architecture](chatbot/backend/architecture.md), [flow](chatbot/backend/flow.md), [API](chatbot/backend/api.md), [data model](chatbot/backend/data-model.md), [configuration](chatbot/backend/configuration.md)
  - Frontend — [architecture](chatbot/frontend/architecture.md), [flow](chatbot/frontend/flow.md), [configuration](chatbot/frontend/configuration.md)

## Adding docs

Each app folder can hold more files than the ones above (for example `deployment.md`, `troubleshooting.md`, `decisions.md`); add them to this index.
