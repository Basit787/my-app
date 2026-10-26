import { useEffect } from "react";
import { isMobileLayout } from "frontend-common";

/**
 * On phones, let the system back button/gesture close an overlay screen (an open chat, contact info…)
 * instead of leaving the app. Each open layer pushes a history entry tagged with `key`; layers stack,
 * so back closes the top-most one first.
 */
export const useBackButtonClose = (open: boolean, onClose: () => void, key: string) => {
  useEffect(() => {
    if (!open || !isMobileLayout()) return;

    window.history.pushState({ ...window.history.state, [key]: true }, "");
    const onPopState = () => {
      if (!window.history.state?.[key]) onClose();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed from the UI rather than the back button: drop the entry we pushed
      if (window.history.state?.[key]) window.history.back();
    };
  }, [open, onClose, key]);
};
