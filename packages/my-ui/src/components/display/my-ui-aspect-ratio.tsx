import type { ReactNode } from "react";
import { AspectRatio } from "my-ui/ui/aspect-ratio";
import { cn } from "my-ui/lib/utils";

type MyUiAspectRatioProps = {
  ratio?: number;
  // Image source; or pass children instead
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
};

export function MyUiAspectRatio({ ratio = 16 / 9, src, alt = "", children, className }: MyUiAspectRatioProps) {
  return (
    <AspectRatio ratio={ratio} className={cn("overflow-hidden rounded-lg bg-muted", className)}>
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : children}
    </AspectRatio>
  );
}
