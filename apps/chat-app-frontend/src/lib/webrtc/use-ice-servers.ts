import { useCallback, useEffect, useRef } from "react";
import { fetchIceServers } from "@/features/chat/api/api";

// STUN/TURN servers for peer connections: fetched once (prefetched while `enabled`), retried after a failure
export const useIceServers = (enabled: boolean) => {
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const loadingRef = useRef<Promise<void> | null>(null);

  const ensureIceServers = useCallback(async () => {
    if (iceServersRef.current.length > 0) return;
    loadingRef.current ??= fetchIceServers()
      .then((config) => {
        iceServersRef.current = config.iceServers;
      })
      .catch((error) => {
        console.error(error);
        loadingRef.current = null;
      });
    await loadingRef.current;
  }, []);

  useEffect(() => {
    if (enabled) void ensureIceServers();
  }, [enabled, ensureIceServers]);

  return { iceServersRef, ensureIceServers };
};
