import type { ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { deployedDomain } from "ports";
import { Toaster, TooltipProvider, ThemeProvider } from "my-ui";
import type { AuthClient } from "../auth/client";
import { AuthProvider } from "../auth/react/auth-provider";
import { CookieConsent } from "../legal/cookie-consent";

type AppProvidersProps = {
  authClient: AuthClient;
  queryClient: QueryClient;
  children: ReactNode;
};

// Providers every web app mounts at its root: theme, React Query, the shared auth session, tooltips, toasts
export const AppProviders = ({ authClient, queryClient, children }: AppProvidersProps) => (
  // On subdomains the theme cookie is set on the parent domain, so every app shares it
  <ThemeProvider defaultTheme="dark" cookieDomain={deployedDomain() ?? undefined}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={authClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
      <Toaster richColors closeButton position="top-right" />
      <CookieConsent />
    </QueryClientProvider>
  </ThemeProvider>
);
