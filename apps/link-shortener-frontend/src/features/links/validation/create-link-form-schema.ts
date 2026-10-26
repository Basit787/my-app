import { z } from "zod";
import { slugSchema } from "./slug-schema";
import { urlSchema } from "./url-schema";

// The create form's raw values: optional fields arrive as "" rather than undefined
export const createLinkFormSchema = z.object({
  url: urlSchema,
  slug: z.union([z.literal(""), slugSchema]),
  title: z.string().trim().max(200),
});
