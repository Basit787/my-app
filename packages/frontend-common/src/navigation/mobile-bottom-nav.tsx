import { House, UserRound } from "lucide-react";
import { cn } from "my-ui";
import { serviceUrl } from "ports";
import { useState } from "react";
import type { MobileNavItem } from "./mobile-nav-item";
import { ProfileScreen } from "./profile-screen";

type MobileBottomNavProps = {
  items: MobileNavItem[];
  // On the home launcher itself: one button switches between Profile and Home
  isHome?: boolean;
  className?: string;
};

const cell = "flex flex-col items-center justify-center gap-0.5 py-2 text-xs [&_svg]:size-5";

// Bottom tab bar on phones: the app's tabs and Home (Profile on the launcher); hidden from md up
export const MobileBottomNav = ({ items, isHome = false, className }: MobileBottomNavProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {profileOpen && (
        <ProfileScreen className="fixed inset-0 z-40 pb-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
      )}
      <nav
        className={cn(
          "shrink-0 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
          className,
          profileOpen && "z-50",
        )}
      >
        <div className="grid auto-cols-fr grid-flow-col">
          {items.map((item) => {
            const active = item.active && !profileOpen;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  item.onSelect();
                }}
                aria-current={active ? "page" : undefined}
                className={cn(cell, active ? "text-primary" : "text-muted-foreground")}
              >
                <span className="relative">
                  {item.icon}
                  {!!item.badge && (
                    <span className="absolute -top-1.5 -right-3 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.label}
              </button>
            );
          })}
          {isHome ? (
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(cell, "text-muted-foreground")}
            >
              {profileOpen ? <House /> : <UserRound />}
              {profileOpen ? "Home" : "Profile"}
            </button>
          ) : (
            <a href={serviceUrl("home", "frontend")} className={cn(cell, "text-muted-foreground")}>
              <House />
              Home
            </a>
          )}
        </div>
      </nav>
    </>
  );
};
