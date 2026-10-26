import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "frontend-common";
import { ChatWaveLogo } from "@/components/brand/ChatWaveLogo";
import { ChatPage } from "@/features/chat/chat-page";
import { ModeToggle } from "my-ui";

export const Route = createFileRoute("/")({ component: ChatRoute });

function ChatRoute() {
  return (
    <AuthGate
      appName="ChatWave"
      logo={<ChatWaveLogo className="h-12 w-12 rounded-2xl ring-1 ring-primary/20" />}
      headerRight={<ModeToggle />}
    >
      <ChatPage />
    </AuthGate>
  );
}
