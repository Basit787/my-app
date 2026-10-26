import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { AuthGate } from "frontend-common";
import { ModeToggle } from "my-ui";
import { ChatPage } from "@/features/chat/chat-page";

type ChatSearch = { c?: string };

// ?c=<conversation id> keeps the open chat across reloads
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): ChatSearch => ({
    c: typeof search.c === "string" ? search.c : undefined,
  }),
  component: IndexPage,
});

function IndexPage() {
  const { c } = Route.useSearch();

  return (
    <AuthGate
      appName="AI Chatbot"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bot className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <ChatPage conversationId={c} />
    </AuthGate>
  );
}
