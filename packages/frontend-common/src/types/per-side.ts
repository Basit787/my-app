import type { PORTS } from "ports";

// One value per project and side (frontend/backend) of PORTS
export type PerSide = {
  [P in keyof typeof PORTS]: Record<Extract<keyof (typeof PORTS)[P], "frontend" | "backend">, string>;
};
