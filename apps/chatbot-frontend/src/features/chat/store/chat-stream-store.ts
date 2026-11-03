import { create } from "zustand";
import type { Source } from "../api/api";

type ChatStreamState = {
  // The reply being written; null while no reply is streaming
  streamingText: string | null;
  streamingSources: Source[];
  streamingStatus: string | null;
  // Aborts the running reply (Stop button)
  controller: AbortController | null;
  start: (controller: AbortController) => void;
  setText: (text: string) => void;
  setSources: (sources: Source[]) => void;
  setStatus: (status: string | null) => void;
  finish: () => void;
};

export const useChatStreamStore = create<ChatStreamState>((set) => ({
  streamingText: null,
  streamingSources: [],
  streamingStatus: null,
  controller: null,
  start: (controller) => set({ controller, streamingText: "", streamingSources: [], streamingStatus: null }),
  setText: (text) => set({ streamingText: text }),
  setSources: (sources) => set({ streamingSources: sources }),
  setStatus: (status) => set({ streamingStatus: status }),
  finish: () => set({ controller: null, streamingText: null, streamingSources: [], streamingStatus: null }),
}));
