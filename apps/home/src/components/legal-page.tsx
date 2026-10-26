import { ArrowLeft } from "lucide-react";
import { Button } from "my-ui";
import type { LegalSection } from "@/lib/legal-section";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
];

type LegalPageProps = { title: string; updated: string; sections: LegalSection[] };

// Public page (no sign-in needed) for the terms and the privacy policy
export const LegalPage = ({ title, updated, sections }: LegalPageProps) => (
  <div className="min-h-dvh bg-background">
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2">
        <a href="/">
          <ArrowLeft />
          Home
        </a>
      </Button>
      <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated {updated}</p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <nav className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t pt-6 text-sm text-muted-foreground">
        {LEGAL_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-foreground hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
    </main>
  </div>
);
