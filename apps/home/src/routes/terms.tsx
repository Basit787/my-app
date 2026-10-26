import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { TERMS_OF_SERVICE } from "@/lib/terms-of-service";

export const Route = createFileRoute("/terms")({ component: TermsRoute });

function TermsRoute() {
  return <LegalPage title="Terms of Service" updated="21 October 2026" sections={TERMS_OF_SERVICE} />;
}
