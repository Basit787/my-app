import type { ReactNode } from "react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "my-ui/ui/item";

type MyUiItemProps = {
  title: ReactNode;
  description?: ReactNode;
  // Icon or avatar on the left
  media?: ReactNode;
  // Buttons on the right
  actions?: ReactNode;
  variant?: "default" | "outline" | "muted";
  className?: string;
};

// List row: media, title, description and actions
export function MyUiItem({ title, description, media, actions, variant, className }: MyUiItemProps) {
  return (
    <Item variant={variant} className={className}>
      {media && <ItemMedia>{media}</ItemMedia>}
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemContent>
      {actions && <ItemActions>{actions}</ItemActions>}
    </Item>
  );
}
