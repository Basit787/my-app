import { z } from "zod";

export const slugSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,64}$/, "Use 3–64 letters, digits, - or _");
