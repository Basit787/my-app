import { randomBytes } from "node:crypto";
import { scryptAsync } from "./scrypt-async.js";

const KEY_LENGTH = 64;

// "scrypt:<salt>:<hash>" with a random salt per password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
};
