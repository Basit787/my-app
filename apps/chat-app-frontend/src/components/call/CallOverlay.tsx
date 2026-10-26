import { createPortal } from "react-dom";
import { CurrentCallScreen } from "./CurrentCallScreen";
import { DesktopCallPanel } from "./DesktopCallPanel";
import { MobileCallLayer } from "./MobileCallLayer";
import { RemoteCallAudio } from "./RemoteCallAudio";
import { useCallOverlay } from "./use-call-overlay";

// Incoming and active calls on top of the app: full screen on phones, a draggable panel on desktop
export const CallOverlay = () => {
  const call = useCallOverlay();
  if (!call.visible) return null;

  const screen = <CurrentCallScreen call={call} />;
  return createPortal(
    <>
      <RemoteCallAudio call={call} />
      {call.isMobile ? (
        <MobileCallLayer call={call} screen={screen} />
      ) : (
        <DesktopCallPanel call={call} screen={screen} />
      )}
    </>,
    document.body,
  );
};
