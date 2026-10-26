import { createAppApiClient } from "frontend-common";
import { authClient } from "@/lib/auth";

export const apiClient = createAppApiClient(authClient, import.meta.env.VITE_API_URL ?? "/api");
