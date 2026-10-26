import { Cookie } from "lucide-react";
import { Button } from "my-ui";
import { useEffect, useState } from "react";
import { legalUrl } from "./legal-url";

// A cookie, not localStorage: one answer covers every app on this host, whatever its port
const CONSENT_COOKIE = "cookie_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const hasAnswered = () => document.cookie.split("; ").some((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));

// Bottom banner until the user picks; sits above the mobile bottom navigation
export const CookieConsent = () => {
  const [open, setOpen] = useState(false);

  // Read after mount so server-rendered pages (Next) hydrate without a mismatch
  useEffect(() => setOpen(!hasAnswered()), []);

  const answer = (value: "all" | "essential") => {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-20 z-[60] mx-auto max-w-xl rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg md:bottom-4"
    >
      <div className="flex gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          We use essential cookies to keep you signed in and to remember your preferences. We don&apos;t use advertising
          or tracking cookies.{" "}
          <a href={legalUrl("cookies")} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Cookie Policy
          </a>
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => answer("essential")}>
          Essential only
        </Button>
        <Button type="button" size="sm" onClick={() => answer("all")}>
          Accept all
        </Button>
      </div>
    </div>
  );
};
