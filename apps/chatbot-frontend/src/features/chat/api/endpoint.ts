export const chatEndpoints = {
  conversations: () => "/conversations",
  conversation: (id: string) => `/conversations/${encodeURIComponent(id)}`,
  messages: (id: string) => `/conversations/${encodeURIComponent(id)}/messages`,
  documents: (id: string) => `/conversations/${encodeURIComponent(id)}/documents`,
  document: (id: string, documentId: string) =>
    `/conversations/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`,
};
