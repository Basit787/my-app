import type { AuthClient } from "../auth/client";
import { createApiClient } from "./client";

// An app's API client: every call sends the signed-in user's JWT; a 401 (expired token) signs out
export const createAppApiClient = (authClient: AuthClient, baseURL: string) =>
  createApiClient({
    baseURL,
    getAccessToken: authClient.getToken,
    onUnauthorized: authClient.signOut,
  });
