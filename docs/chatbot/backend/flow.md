# Chatbot API — flows

## Sending a message

```mermaid
sequenceDiagram
    participant UI as Chat UI
    participant S as ConversationsService
    participant G as ChatGraphService
    participant V as pgvector
    participant L as Ollama
    participant W as SearXNG
    UI->>S: POST /conversations/:id/messages {content}
    S-->>UI: 200 NDJSON stream opens (ownership checked first)
    opt first message
        S-->>UI: {type:"conversation"} (title from the message)
    end
    S->>G: streamReply(threadId, content)
    opt the conversation has documents
        G->>L: embed the question
        G->>V: 4 closest chunks of this conversation
        G-->>UI: {type:"sources"}
    end
    G->>L: chat completion with excerpts and the web_search tool
    opt the model calls web_search
        G-->>UI: {type:"tool", name, input}
        G->>W: search
        G->>L: chat completion with the results
    end
    L-->>G: tokens
    G-->>UI: {type:"delta", text} ...
    S-->>UI: {type:"done", message, conversation}
```

## Uploading a document

1. Ownership of the conversation is checked, then the type (`.txt`, `.md`, `.pdf`) and the size.
2. Text is extracted; an empty result is a `400` (scanned PDFs have no text layer).
3. The file goes to S3, the text is split and embedded into `document_chunks`, and the `documents` row is saved with the chunk count.

## Stop and disconnects

- The reply keeps generating if the browser leaves, so it is always saved.
- Stop closes the request; the service aborts the graph and saves the partial reply (with its sources) as the assistant message. A turn stopped during a tool call leaves its tool steps in the thread; later turns skip them.

## Failures

- Model errors arrive as `{type:"error"}` with Ollama's message; "signal: killed" means Ollama ran out of memory in Docker.
- A failed web search is logged with the upstream status and body and handed to the model as text.
