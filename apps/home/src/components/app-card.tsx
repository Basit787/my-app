import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, cn } from "my-ui";
import type { AppEntry } from "@/lib/apps";
import { warmApp } from "@/lib/warm-app";

type AppCardProps = { app: AppEntry; layout?: "grid" | "list" };

export const AppCard = ({ app, layout = "grid" }: AppCardProps) => {
  const Icon = app.icon;
  const [opening, setOpening] = useState(false);

  // Coming back with the browser's back button restores this page as it was left
  useEffect(() => {
    const reset = () => setOpening(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const status = opening ? (
    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
  ) : (
    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
  );

  return (
    <a
      href={app.url}
      onPointerEnter={() => warmApp(app.url)}
      onFocus={() => warmApp(app.url)}
      onClick={(event) => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey) setOpening(true);
      }}
      aria-busy={opening}
      className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card
        className={cn(
          "h-full transition-colors group-hover:border-primary/50 group-hover:bg-accent/40",
          layout === "list" ? "py-4" : "max-sm:py-4",
        )}
      >
        {layout === "list" ? (
          <CardHeader className="flex flex-row items-center gap-3 max-sm:px-4 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-base">{app.name}</CardTitle>
              <CardDescription className="truncate">{opening ? "Opening…" : app.description}</CardDescription>
            </div>
            {status}
          </CardHeader>
        ) : (
          <CardHeader className="gap-3 max-sm:gap-2 max-sm:px-4">
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12 sm:rounded-2xl">
                <Icon className="size-5 sm:size-6" />
              </div>
              {status}
            </div>
            <CardTitle className="text-base sm:text-lg">{app.name}</CardTitle>
            <CardDescription className="line-clamp-2 max-sm:text-xs">
              {opening ? "Opening…" : app.description}
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    </a>
  );
};
