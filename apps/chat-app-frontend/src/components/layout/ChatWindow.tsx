import { ScrollArea } from "my-ui";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { GroupInfoDialog } from "@/components/chat/GroupInfoDialog";
import { ContactInfoPanel } from "@/components/chat/ContactInfoPanel";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { MessageSelectionToolbar } from "@/components/chat/MessageSelectionToolbar";
import { CallOverlay } from "@/components/call/CallOverlay";
import { ChatRoomProvider } from "@/features/chat/context/ChatRoomContext";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { useChatStore } from "@/features/chat/store/chat-store";
import { cn } from "@/lib/utils";

const ChatWindowContent = () => {
  const { bottomRef, visibleMessages, username } = useChatRoom();
  const mobileChatOpen = useChatStore((s) => s.mobileChatOpen);

  return (
    <main
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col bg-background/50",
        !mobileChatOpen && "max-md:hidden",
      )}
    >
      <ChatHeader />
      <MessageSelectionToolbar messages={visibleMessages} selfUsername={username} />
      <GroupInfoDialog />
      <CallOverlay />
      <ScrollArea className="min-h-0 flex-1">
        <MessageList />
        <div ref={bottomRef} />
      </ScrollArea>
      <MessageInput />
      <ContactInfoPanel />
    </main>
  );
};

export const ChatWindow = () => (
  <ChatRoomProvider>
    <ChatWindowContent />
  </ChatRoomProvider>
);
