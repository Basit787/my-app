import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatGroup } from "@/features/chat/api/api";
import { CallerAvatar } from "./CallerAvatar";

type CallScreenProps = {
  title: string;
  status: string;
  group?: ChatGroup;
  onMinimize?: () => void;
  // Replaces the big avatar in the middle (e.g. a group video grid)
  children?: ReactNode;
  // Full-bleed layer behind everything (remote video)
  background?: ReactNode;
  // Floating layer above everything (self-view)
  pip?: ReactNode;
  footer: ReactNode;
};

// WhatsApp-style dark call layout: name and status on top, avatar or video in the middle, controls at the bottom
export const CallScreen = ({
  title,
  status,
  group,
  onMinimize,
  children,
  background,
  pip,
  footer,
}: CallScreenProps) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b141a] text-white">
    {background && (
      <>
        <div className="absolute inset-0">{background}</div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent" />
      </>
    )}

    <div className="relative z-10 flex items-start gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      {onMinimize && (
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize call"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      )}
      <div className={cn("min-w-0 flex-1 text-center", onMinimize && "pr-9")}>
        <p className="truncate text-2xl font-medium">{title}</p>
        <p className="mt-1 text-sm tabular-nums text-white/70">{status}</p>
      </div>
    </div>

    <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-4">
      {children ??
        (!background && <CallerAvatar group={group} name={title} className="h-36 w-36" fallbackClassName="text-5xl" />)}
    </div>

    {pip}

    <div className="relative z-10 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{footer}</div>
  </div>
);
