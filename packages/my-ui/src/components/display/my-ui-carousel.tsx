import type { ReactNode } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "my-ui/ui/carousel";
import { cn } from "my-ui/lib/utils";

type MyUiCarouselProps = {
  items: ReactNode[];
  orientation?: "horizontal" | "vertical";
  loop?: boolean;
  showArrows?: boolean;
  // Tailwind basis per slide, e.g. "basis-1/3"
  itemClassName?: string;
  className?: string;
};

export function MyUiCarousel({
  items,
  orientation,
  loop,
  showArrows = true,
  itemClassName,
  className,
}: MyUiCarouselProps) {
  return (
    <Carousel orientation={orientation} opts={{ loop }} className={cn("w-full", className)}>
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className={itemClassName}>
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>
      {showArrows && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
}
