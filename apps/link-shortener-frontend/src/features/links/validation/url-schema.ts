import { z } from "zod";

// An absolute http(s) URL
export const urlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((value) => /^https?:\/\//i.test(value), "The URL must start with http:// or https://");
