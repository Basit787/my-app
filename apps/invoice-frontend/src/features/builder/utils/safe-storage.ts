import type { StateStorage } from "zustand/middleware";

// localStorage that never throws (private windows, a full quota from a large logo): the draft is just not kept
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // The draft stays in memory for this visit
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Nothing stored
    }
  },
};
