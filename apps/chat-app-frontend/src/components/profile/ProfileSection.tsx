import { ArrowLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "my-ui";
import { usePresenceStatus } from "@/features/profile/hooks";
import { STATUS_OPTIONS } from "@/lib/status-options";
import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  onBack: () => void;
  onLogout: () => void;
  onViewCalls: () => void;
};

export const ProfileSection = ({ onBack, onLogout, onViewCalls }: ProfileSectionProps) => {
  const { userStatus, changeStatus } = usePresenceStatus();

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === userStatus) ?? STATUS_OPTIONS[0];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        {/* Phones switch sections from the bottom navigation */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 max-md:hidden"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">Profile</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  onClick={() => void changeStatus(option.value)}
                  className={cn(
                    "h-auto justify-start gap-2 rounded-lg border px-3 py-2 font-normal",
                    userStatus === option.value
                      ? "border-primary bg-primary/10 text-foreground hover:bg-primary/10"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", option.color)} />
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Current: <span className="text-foreground">{currentStatus.label}</span>
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onViewCalls}
            className="h-auto w-full justify-between rounded-xl border border-border bg-card/50 px-4 py-3 font-normal hover:bg-muted/50 max-md:hidden"
          >
            <div>
              <p className="text-sm font-medium">Call history</p>
              <p className="text-xs text-muted-foreground">View your recent calls</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
