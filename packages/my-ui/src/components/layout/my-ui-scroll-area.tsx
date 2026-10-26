import * as React from "react";
import { ScrollArea } from "my-ui/ui/scroll-area";

type MyUiScrollAreaProps = React.ComponentProps<typeof ScrollArea> & {
  // Fixed height, e.g. 300 or "50vh"
  height?: number | string;
};

export function MyUiScrollArea({ height, style, ...props }: MyUiScrollAreaProps) {
  return <ScrollArea style={{ height, ...style }} {...props} />;
}
