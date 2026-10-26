import { Mic, MicOff, PhoneOff, SwitchCamera, Video, VideoOff } from "lucide-react";
import { CALL_COLORS } from "./call-colors";
import { RoundButton } from "./RoundButton";

type CallControlsProps = {
  isVideo: boolean;
  micMuted: boolean;
  cameraOff: boolean;
  canSwitchCamera: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onEnd: () => void;
};

// Bottom bar during a call: switch camera, camera on/off, mute, hang up
export const CallControls = ({
  isVideo,
  micMuted,
  cameraOff,
  canSwitchCamera,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  onEnd,
}: CallControlsProps) => (
  <div className="mx-auto flex w-full max-w-sm items-center justify-evenly rounded-3xl bg-[#1f2c34]/90 px-3 py-3 backdrop-blur">
    {isVideo && (
      <>
        {canSwitchCamera && (
          <RoundButton label="Switch camera" onClick={onSwitchCamera}>
            <SwitchCamera className="h-6 w-6" />
          </RoundButton>
        )}
        <RoundButton
          label={cameraOff ? "Turn camera on" : "Turn camera off"}
          onClick={onToggleCamera}
          className={cameraOff ? "bg-white text-[#0b141a]" : undefined}
        >
          {cameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </RoundButton>
      </>
    )}
    <RoundButton
      label={micMuted ? "Unmute" : "Mute"}
      onClick={onToggleMic}
      className={micMuted ? "bg-white text-[#0b141a]" : undefined}
    >
      {micMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
    </RoundButton>
    <RoundButton label="End call" onClick={onEnd} className={CALL_COLORS.red}>
      <PhoneOff className="h-6 w-6" />
    </RoundButton>
  </div>
);
