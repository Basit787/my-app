# Chatbot UI — flows

1. With no `?c=`, the page shows suggestions. Sending a message, or adding a document with `+`, creates a conversation (`POST /api/conversations`) and switches the URL to it.
2. `+` uploads the file to the open chat; the button spins until the backend has embedded it, then the document appears as a badge above the message box.
3. Sending adds the user message to the cache and reads `POST /api/conversations/:id/messages` line by line:
   - `conversation` updates the sidebar title.
   - `sources` shows the excerpts under the live reply.
   - `tool` shows "Searching the web: …" until text arrives.
   - `delta` grows the reply (Markdown, rendered live), `done` replaces it with the saved message, and `error` shows a toast.
4. Stop aborts the request; the partial reply stays on screen and on the server.
5. Removing a document (badge ×, confirm) stops it from being used in that chat. Rename and delete live in the chat's menu in the top bar; deleting returns to a new chat.
