import { createAuthClient } from "frontend-common";

// The auth service, proxied by Vite at /auth-api so its session cookie is first-party
export const AUTH_API_URL = import.meta.env.VITE_AUTH_URL || "/auth-api";

export const authClient = createAuthClient({ baseUrl: AUTH_API_URL });
