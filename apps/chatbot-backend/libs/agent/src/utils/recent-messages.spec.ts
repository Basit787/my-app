import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { recentMessages } from "./recent-messages.js";

describe("recentMessages", () => {
  it("keeps the newest messages that fit, oldest first", () => {
    const messages = [
      new HumanMessage("a".repeat(10)),
      new AIMessage("b".repeat(10)),
      new HumanMessage("c".repeat(10)),
    ];
    expect(recentMessages(messages, 25).map((m) => m.text[0])).toEqual(["b", "c"]);
  });

  it("always keeps the latest message, even when it alone is too long", () => {
    expect(recentMessages([new HumanMessage("x".repeat(50))], 10)).toHaveLength(1);
  });
});
