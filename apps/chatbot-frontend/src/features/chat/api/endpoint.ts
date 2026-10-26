export const chatEndpoints = {
  conversations: () => "/conversations",
  conversation: (id: string) => `/conversations/${encodeURIComponent(id)}`,
  messages: (id: string) => `/conversations/${encodeURIComponent(id)}/messages`,
};
