import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "my-ui/ui/tabs";

type MyUiTab = { value: string; label: ReactNode; content: ReactNode; icon?: ReactNode; disabled?: boolean };

type MyUiTabsProps = {
  tabs: MyUiTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "default" | "line";
  className?: string;
};

export function MyUiTabs({ tabs, defaultValue, value, onValueChange, variant, className }: MyUiTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList variant={variant}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
