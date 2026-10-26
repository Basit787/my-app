import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "my-ui";
import { CallHistoryItem } from "@/components/call/CallHistoryItem";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore } from "@/features/chat/store/chat-store";

type CallHistorySectionProps = {
  onBack: () => void;
};

export const CallHistorySection = ({ onBack }: CallHistorySectionProps) => {
  const username = useAuthStore((s) => s.username);
  const callHistory = useChatStore((s) => s.callHistory);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">Call history</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
        {callHistory.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Phone className="h-10 w-10 opacity-40" />
            <p className="text-sm">No calls yet</p>
            <p className="text-xs">Your audio and video calls will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {callHistory.map((call) => (
              <CallHistoryItem key={call.id} call={call} selfUsername={username} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
