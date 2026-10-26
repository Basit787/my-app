import { appConfig } from "@app/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ChatGraphService } from "./chat-graph.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("ChatGraphService", () => {
  let chatGraph: ChatGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGraphService,
        {
          provide: appConfig.KEY,
          useValue: {
            databaseUrl: "postgres://postgres:postgres@127.0.0.1:5433/chatbot",
            ollama: { url: "http://localhost:11434", model: "qwen2.5:1.5b" },
          },
        },
      ],
    }).compile();

    chatGraph = module.get<ChatGraphService>(ChatGraphService);
  });

  it("should be defined", () => {
    expect(chatGraph).toBeDefined();
  });
});
