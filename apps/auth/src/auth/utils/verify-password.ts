import { timingSafeEqual } from "node:crypto";
import { scryptAsync } from "./scrypt-async.js";

// Compares in constant time, so the response time reveals nothing about the hash
export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
};
