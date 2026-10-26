import type { Role } from "backend-common";

export type { AuthUser, Role } from "backend-common";

export const ROLES = { USER: "user" as Role, ADMIN: "admin" as Role };

export type PresenceStatus = "online" | "away" | "busy" | "offline";
