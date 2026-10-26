import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RoundButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
  caption?: string;
};

// Big round call button with an optional caption underneath
export const RoundButton = ({ label, onClick, className, children, caption }: RoundButtonProps) => (
  <div className="flex flex-col items-center gap-1.5">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition-colors active:scale-95",
        className ?? "bg-white/15 text-white hover:bg-white/25",
      )}
    >
      {children}
    </button>
    {caption && <span className="text-xs text-white/80">{caption}</span>}
  </div>
);
