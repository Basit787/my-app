import { AppHeader, MobileBottomNav } from "frontend-common";
import { List, Plus } from "lucide-react";
import { MyUiTabs } from "my-ui";
import { useState } from "react";
import { CreateLinkForm } from "@/components/create-link-form";
import { LinksTable } from "@/components/links-table";

// Signed-in page: header and tabs on desktop, bottom navigation on mobile
export const LinksPage = () => {
  const [tab, setTab] = useState("create");
  return (
    <div className="min-h-dvh bg-background">
      <AppHeader app="Link Shortener" page={tab === "create" ? "Create link" : "Links"} className="max-md:hidden" />
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-24 md:px-6 md:py-8">
        <MyUiTabs
          className="max-md:[&>[data-slot=tabs-list]]:hidden"
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: "create",
              label: "Create link",
              icon: <Plus />,
              content: <CreateLinkForm onCreated={() => setTab("links")} />,
            },
            { value: "links", label: "Links", icon: <List />, content: <LinksTable /> },
          ]}
        />
      </main>
      <MobileBottomNav
        className="fixed inset-x-0 bottom-0 z-20"
        items={[
          {
            key: "create",
            label: "Create",
            icon: <Plus />,
            active: tab === "create",
            onSelect: () => setTab("create"),
          },
          { key: "links", label: "Links", icon: <List />, active: tab === "links", onSelect: () => setTab("links") },
        ]}
      />
    </div>
  );
};
