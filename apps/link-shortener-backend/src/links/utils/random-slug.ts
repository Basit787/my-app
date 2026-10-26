import { randomBytes } from "node:crypto";

// No look-alike characters (0/O, 1/l/I)
const SLUG_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SLUG_LENGTH = 7;

export const randomSlug = () =>
  Array.from(randomBytes(SLUG_LENGTH), (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length]).join("");
