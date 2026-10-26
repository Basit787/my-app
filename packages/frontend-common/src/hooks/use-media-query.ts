import { useCallback, useSyncExternalStore } from "react";

/** Below Tailwind's `md` breakpoint the app shows either the conversation list or a chat, not both. */
export const MOBILE_LAYOUT_QUERY = "(max-width: 767px)";

export const isMobileLayout = () => window.matchMedia(MOBILE_LAYOUT_QUERY).matches;

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

export const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible");
