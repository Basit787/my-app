import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { AppHeader, MobileBottomNav, useAuth } from "frontend-common";
import { cn, MyUiToggleGroup } from "my-ui";
import { AppCard } from "@/components/app-card";
import { APPS } from "@/lib/apps";
import { warmApp } from "@/lib/warm-app";

type Layout = "grid" | "list";

const LAYOUT_KEY = "home:layout";

const savedLayout = (): Layout => {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
};

export const HomePage = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<Layout>(savedLayout);

  const changeLayout = (value: string) => {
    if (value !== "grid" && value !== "list") return;
    setLayout(value);
    try {
      localStorage.setItem(LAYOUT_KEY, value);
    } catch {
      // Private mode: the choice just isn't remembered
    }
  };

  // Start every app's server warming as soon as home is shown
  useEffect(() => APPS.forEach((app) => warmApp(app.url)), []);

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader className="max-md:hidden" />

      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick an app to open. You stay signed in across all of them.
            </p>
          </div>
          <MyUiToggleGroup
            type="single"
            variant="outline"
            className="max-md:hidden"
            size="sm"
            value={layout}
            onValueChange={changeLayout}
            items={[
              { value: "grid", icon: <LayoutGrid />, ariaLabel: "Grid view" },
              { value: "list", icon: <List />, ariaLabel: "List view" },
            ]}
          />
        </div>
        <div
          className={cn(
            "mt-6 grid gap-3 md:mt-8",
            layout === "grid" ? "grid-cols-2 sm:gap-4 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          {APPS.map((app) => (
            <AppCard key={app.id} app={app} layout={layout} />
          ))}
        </div>
      </main>
      <MobileBottomNav
        isHome
        className="fixed inset-x-0 bottom-0 z-20"
        items={[
          {
            key: "layout",
            label: layout === "grid" ? "List" : "Grid",
            icon: layout === "grid" ? <List /> : <LayoutGrid />,
            onSelect: () => changeLayout(layout === "grid" ? "list" : "grid"),
          },
        ]}
      />
    </div>
  );
};
