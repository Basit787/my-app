# Chatbot API — flows

## Sending a message

```mermaid
sequenceDiagram
    participant UI as Chat UI
    participant C as ConversationsController
    participant S as ConversationsService
    participant G as ChatGraphService
    participant P as PostgresSaver
    participant L as Ollama
    UI->>C: POST /conversations/:id/messages {content}
    C->>S: startReply (ownership check first: 404 stays JSON)
    S-->>UI: 200 NDJSON stream opens
    opt first message
        S-->>UI: {type:"conversation"} (title from the message)
    end
    S->>G: streamReply(threadId, content)
    G->>P: load thread history, save the user message
    G->>L: chat completion (streamed)
    L-->>G: tokens
    G-->>UI: {type:"delta", text} ...
    G->>P: save the reply
    S-->>UI: {type:"done", message, conversation}
```

## Stop and disconnects

- The reply keeps generating if the browser leaves, so it is always saved.
- Stop closes the request; Nest destroys the stream, the service aborts the graph and saves the partial reply as the assistant message.

## Failures

- Model errors arrive as `{type:"error"}` with Ollama's message; "signal: killed" means Ollama ran out of memory in Docker.
