# Chatbot UI — flows

1. With no `?c=`, the page shows suggestions; sending creates a conversation (`POST /api/conversations`) and switches the URL to it.
2. The user message is added to the cache, and `POST /api/conversations/:id/messages` is read line by line.
3. `conversation` updates the sidebar title, `delta` grows the reply (Markdown, rendered live), `done` replaces it with the saved message, `error` shows a toast.
4. Stop aborts the request; the partial reply stays on screen and on the server.
5. Rename and delete live in the chat's menu in the top bar; deleting returns to a new chat.
