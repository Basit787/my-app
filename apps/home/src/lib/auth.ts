import { createAuthClient } from "frontend-common";

// The auth service, proxied by Vite at /auth-api so its session cookie is first-party
export const authClient = createAuthClient({ baseUrl: import.meta.env.VITE_AUTH_URL || "/auth-api" });
