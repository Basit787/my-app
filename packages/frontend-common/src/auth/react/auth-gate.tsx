import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { LoginScreen, type LoginScreenProps } from "./login-screen";
import { useAuth } from "./use-auth";

type AuthGateProps = LoginScreenProps & { children: ReactNode };

// Renders the app only for a signed-in user; otherwise the shared login screen
export const AuthGate = ({ children, ...loginProps }: AuthGateProps) => {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (status === "signedOut") return <LoginScreen {...loginProps} />;
  return <>{children}</>;
};
