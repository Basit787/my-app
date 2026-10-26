import { LogOut } from "lucide-react";
import { Button, cn, useNotification, useTheme } from "my-ui";
import { AccountSettings } from "../auth/react/account-settings";
import { useAuth } from "../auth/react/use-auth";
import { THEMES } from "./themes";

type ProfileScreenProps = { className?: string };

// Full-screen profile on phones, laid out like the chat app's: account settings, theme, sign out
export const ProfileScreen = ({ className }: ProfileScreenProps) => {
  const { client } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return (
    <div className={cn("flex flex-col bg-background", className)}>
      <div className="flex shrink-0 items-center border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Profile</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-6">
        <AccountSettings
          onSuccess={(message) => showSuccessNotification(message)}
          onError={(error, fallback) => showErrorNotification(error, fallback)}
        >
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "h-auto justify-start gap-2 rounded-lg border px-3 py-2 font-normal",
                    theme === value
                      ? "border-primary bg-primary/10 text-foreground hover:bg-primary/10"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={() => void client.signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </AccountSettings>
      </div>
    </div>
  );
};
