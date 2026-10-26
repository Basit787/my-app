import { Phone, PhoneOff, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { CALL_COLORS } from "./call-colors";
import { RoundButton } from "./RoundButton";

type IncomingActionsProps = {
  onAccept: () => void;
  onDecline: () => void;
  isVideo: boolean;
  acceptLabel: string;
};

// Decline / accept buttons on an incoming call
export const IncomingActions = ({ onAccept, onDecline, isVideo, acceptLabel }: IncomingActionsProps) => (
  <div className="mx-auto flex max-w-xs items-center justify-between px-6">
    <RoundButton label="Decline" caption="Decline" onClick={onDecline} className={cn("h-16 w-16", CALL_COLORS.red)}>
      <PhoneOff className="h-7 w-7" />
    </RoundButton>
    <RoundButton
      label={acceptLabel}
      caption={acceptLabel}
      onClick={onAccept}
      className={cn("h-16 w-16 animate-pulse", CALL_COLORS.green)}
    >
      {isVideo ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
    </RoundButton>
  </div>
);
