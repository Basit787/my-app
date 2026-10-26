import { scrypt } from "node:crypto";
import { promisify } from "node:util";

// node:crypto scrypt as a promise: (password, salt, keyLength) => derived key
export const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keyLength: number) => Promise<Buffer>;
