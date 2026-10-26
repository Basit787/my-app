import { create } from "zustand";

type ChatStreamState = {
  // The reply being written; null while no reply is streaming
  streamingText: string | null;
  // Aborts the running reply (Stop button)
  controller: AbortController | null;
  start: (controller: AbortController) => void;
  setText: (text: string) => void;
  finish: () => void;
};

// Shared by the composer (send/stop), the message list (live text) and the page (empty state)
export const useChatStreamStore = create<ChatStreamState>((set) => ({
  streamingText: null,
  controller: null,
  start: (controller) => set({ controller, streamingText: "" }),
  setText: (text) => set({ streamingText: text }),
  finish: () => set({ controller: null, streamingText: null }),
}));
