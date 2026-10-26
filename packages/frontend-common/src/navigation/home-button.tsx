import { House } from "lucide-react";
import { Button } from "my-ui";
import { serviceUrl } from "ports";

type HomeButtonProps = { className?: string };

// Back to the home launcher, on the host this page was opened from (localhost or a LAN IP)
export const HomeButton = ({ className }: HomeButtonProps) => (
  <Button asChild variant="ghost" size="icon" className={className}>
    <a href={serviceUrl("home", "frontend")} aria-label="Home" title="Home">
      <House />
    </a>
  </Button>
);
