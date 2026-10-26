import { hashPassword } from "./hash-password.js";
import { verifyPassword } from "./verify-password.js";

describe("password hashing", () => {
  it("accepts the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("Alice123!");
    expect(stored).not.toContain("Alice123!");
    expect(await verifyPassword("Alice123!", stored)).toBe(true);
    expect(await verifyPassword("alice123!", stored)).toBe(false);
  });

  it("rejects a stored value that is not a scrypt hash", async () => {
    expect(await verifyPassword("anything", "plain-text")).toBe(false);
  });
});
