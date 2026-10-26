import { cn } from "my-ui";
import { legalUrl } from "./legal-url";

const LINKS = [
  { page: "terms", label: "Terms of Service" },
  { page: "privacy", label: "Privacy Policy" },
  { page: "cookies", label: "Cookie Policy" },
] as const;

// "Terms · Privacy · Cookies" row, opening the home launcher's pages in a new tab
export const LegalLinks = ({ className }: { className?: string }) => (
  <p className={cn("text-center text-xs text-muted-foreground", className)}>
    {LINKS.map((link, index) => (
      <span key={link.page}>
        {index > 0 && " · "}
        <a href={legalUrl(link.page)} target="_blank" rel="noreferrer" className="hover:underline">
          {link.label}
        </a>
      </span>
    ))}
  </p>
);
