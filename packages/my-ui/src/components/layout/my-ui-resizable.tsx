import type { ReactNode } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "my-ui/ui/resizable";
import type { ComponentProps } from "react";

type PanelSize = ComponentProps<typeof ResizablePanel>["defaultSize"];

type MyUiResizableProps = {
  panels: { content: ReactNode; defaultSize?: PanelSize; minSize?: PanelSize }[];
  orientation?: "horizontal" | "vertical";
  withHandle?: boolean;
  className?: string;
};

// Panels separated by draggable handles
export function MyUiResizable({
  panels,
  orientation = "horizontal",
  withHandle = true,
  className,
}: MyUiResizableProps) {
  return (
    <ResizablePanelGroup orientation={orientation} className={className}>
      {panels.flatMap((panel, index) => [
        ...(index > 0 ? [<ResizableHandle key={`handle-${index}`} withHandle={withHandle} />] : []),
        <ResizablePanel key={`panel-${index}`} defaultSize={panel.defaultSize} minSize={panel.minSize}>
          {panel.content}
        </ResizablePanel>,
      ])}
    </ResizablePanelGroup>
  );
}
