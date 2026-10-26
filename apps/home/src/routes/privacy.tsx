import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY_POLICY } from "@/lib/privacy-policy";

export const Route = createFileRoute("/privacy")({ component: PrivacyRoute });

function PrivacyRoute() {
  return <LegalPage title="Privacy Policy" updated="21 October 2026" sections={PRIVACY_POLICY} />;
}
