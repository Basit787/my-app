import { useEffect, useRef } from "react";
import { startRingtone } from "@/lib/call-sounds";

export const useIncomingCallAlerts = (active: boolean, title: string, body: string) => {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      notifiedRef.current = false;
      return;
    }

    const stopRingtone = startRingtone();

    if (document.hidden && !notifiedRef.current && "Notification" in window) {
      notifiedRef.current = true;
      const show = () => {
        try {
          new Notification(title, { body, tag: "incoming-call" });
        } catch {
          // Ignore notification errors.
        }
      };

      if (Notification.permission === "granted") {
        show();
      } else if (Notification.permission !== "denied") {
        void Notification.requestPermission().then((permission) => {
          if (permission === "granted") show();
        });
      }
    }

    return stopRingtone;
  }, [active, body, title]);
};
