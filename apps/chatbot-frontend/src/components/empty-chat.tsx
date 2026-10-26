import { Bot } from "lucide-react";
import { MyUiButton } from "my-ui";
import { useChatStream } from "@/features/chat/api/hooks";

const SUGGESTIONS = [
  "Explain recursion with a simple example",
  "Write a short poem about the sea",
  "Give me 5 ideas for a weekend project",
  "How do I center a div in CSS?",
];

export const EmptyChat = () => {
  const chat = useChatStream();

  return (
    <div className="m-auto flex max-w-2xl flex-col items-center gap-6 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Bot className="size-6" />
      </div>
      <h1 className="text-2xl font-semibold">How can I help you today?</h1>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <MyUiButton
            key={suggestion}
            variant="outline"
            className="h-auto justify-start py-3 text-left whitespace-normal"
            onClick={() => void chat.send(suggestion)}
          >
            {suggestion}
          </MyUiButton>
        ))}
      </div>
    </div>
  );
};
