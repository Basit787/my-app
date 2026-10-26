import { useRef, useState } from "react";
import { House, LogOut, Settings, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MyUiAvatar,
  MyUiDialog,
  useNotification,
  useTheme,
  type Theme,
} from "my-ui";
import { serviceUrl } from "ports";
import { AccountSettings } from "../auth/react/account-settings";
import { useAuth } from "../auth/react/use-auth";
import { THEMES } from "./themes";

// How long the menu stays open after the mouse leaves, so it can travel from the avatar to the menu
const HOVER_CLOSE_DELAY_MS = 200;

// Signed-in user's avatar; hovering (or tapping) it opens profile, settings, theme, home and sign out
export const UserMenu = () => {
  const { user, client } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hoverOpen = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger
          className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Account menu"
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
        >
          <MyUiAvatar name={user.name} src={client.avatarUrl(user.image)} size="sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
          <DropdownMenuLabel className="flex items-center gap-3 py-2">
            <MyUiAvatar name={user.name} src={client.avatarUrl(user.image)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings />
            Profile & settings
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem key={value} value={value}>
                    <Icon />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem asChild>
            <a href={serviceUrl("home", "frontend")}>
              <House />
              Home
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => void client.signOut()}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MyUiDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Profile & settings"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <AccountSettings
          onSuccess={(message) => showSuccessNotification(message)}
          onError={(error, fallback) => showErrorNotification(error, fallback)}
        />
      </MyUiDialog>
    </>
  );
};
