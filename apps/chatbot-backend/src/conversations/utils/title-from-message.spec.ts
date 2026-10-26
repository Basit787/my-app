import { titleFromMessage } from "./title-from-message.js";

describe("titleFromMessage", () => {
  it("keeps short messages on one line", () => {
    expect(titleFromMessage("  How do I\nmake pasta?  ")).toBe("How do I make pasta?");
  });

  it("cuts long messages at a word boundary", () => {
    const title = titleFromMessage(
      "Please explain in detail how the immune system recognises and fights viruses in humans",
    );
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(61);
  });
});
