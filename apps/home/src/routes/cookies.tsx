import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COOKIE_POLICY } from "@/lib/cookie-policy";

export const Route = createFileRoute("/cookies")({ component: CookiesRoute });

function CookiesRoute() {
  return <LegalPage title="Cookie Policy" updated="21 October 2026" sections={COOKIE_POLICY} />;
}
