import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const createWebSearchTool = (search: (query: string) => Promise<string>) =>
  tool(({ query }) => search(query), {
    name: "web_search",
    description:
      "Search the internet. Use it for recent events, live data (prices, weather, scores) or facts you do not know.",
    schema: z.object({ query: z.string().describe("A short web search query") }),
  });
