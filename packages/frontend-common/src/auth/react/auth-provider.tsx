import { useEffect, type ReactNode } from "react";
import type { AuthClient } from "../client";
import { AuthContext } from "./use-auth";

type AuthProviderProps = { client: AuthClient; children: ReactNode };

// Provides the auth client and resumes the session on mount
export const AuthProvider = ({ client, children }: AuthProviderProps) => {
  useEffect(() => {
    void client.restore();
  }, [client]);
  return <AuthContext.Provider value={client}>{children}</AuthContext.Provider>;
};
