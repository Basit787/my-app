import type { ReactNode } from "react";
import { Phone, Video } from "lucide-react";
import { MOBILE_CALL_BAR_HEIGHT, type useCallOverlay } from "./use-call-overlay";

type MobileCallLayerProps = { call: ReturnType<typeof useCallOverlay>; screen: ReactNode };

// Phones: the call fills the screen, or shrinks to a "tap to return" bar at the top when minimized
export const MobileCallLayer = ({ call, screen }: MobileCallLayerProps) =>
  call.showMobileBar ? (
    <button
      type="button"
      onClick={() => call.setMinimized(false)}
      style={{ height: MOBILE_CALL_BAR_HEIGHT }}
      className="fixed inset-x-0 top-0 z-200 flex items-center justify-center gap-2 bg-[#25d366] text-sm font-medium text-[#0b141a]"
    >
      {call.isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
      Tap to return to call · <span className="tabular-nums">{call.status}</span>
    </button>
  ) : (
    <div className="fixed inset-0 z-200" role="dialog" aria-label={`Call with ${call.title}`}>
      {screen}
    </div>
  );
