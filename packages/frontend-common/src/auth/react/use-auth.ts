import { createContext, useContext, useSyncExternalStore } from "react";
import type { AuthClient } from "../client";

export const AuthContext = createContext<AuthClient | null>(null);

export const useAuthClient = () => {
  const client = useContext(AuthContext);
  if (!client) throw new Error("useAuth must be used inside <AuthProvider>");
  return client;
};

export const useAuth = () => {
  const client = useAuthClient();
  const snapshot = useSyncExternalStore(client.subscribe, client.getSnapshot, client.getSnapshot);
  return { ...snapshot, client };
};
