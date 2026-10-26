import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, MessageSquare, SquarePen } from "lucide-react";
import { AppBreadcrumbs, UserMenu } from "frontend-common";
import { MyUiSidebarLayout } from "my-ui";
import { ChatComposer } from "@/components/chat-composer";
import { ConversationMenu } from "@/components/conversation-menu";
import { EmptyChat } from "@/components/empty-chat";
import { MessageList } from "@/components/message-list";
import { useConversation, useConversations } from "./api/hooks";
import { useChatStreamStore } from "./store/chat-stream-store";

type ChatPageProps = {
  // From the ?c= search param; none means a new chat
  conversationId?: string;
};

export const ChatPage = ({ conversationId }: ChatPageProps) => {
  const navigate = useNavigate();
  const conversations = useConversations();
  const detail = useConversation(conversationId);

  const isStreaming = useChatStreamStore((state) => state.streamingText !== null);
  const openConversation = (id?: string) => void navigate({ to: "/", search: id ? { c: id } : {} });

  const active = conversations.data?.find((conversation) => conversation.id === conversationId);
  const messages = detail.data?.messages ?? [];
  const showEmptyState = !conversationId && !isStreaming;

  // A deleted or someone else's chat in the URL falls back to a new chat
  useEffect(() => {
    if (detail.isError) void navigate({ to: "/", search: {} });
  }, [detail.isError, navigate]);

  return (
    <MyUiSidebarLayout
      header={
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </div>
          <span className="font-semibold">AI Chatbot</span>
        </div>
      }
      sections={[
        {
          items: [
            {
              id: "new-chat",
              title: "New chat",
              icon: <SquarePen />,
              isActive: !conversationId,
              onClick: () => openConversation(),
            },
          ],
        },
        {
          label: "Chats",
          items: (conversations.data ?? []).map((conversation) => ({
            id: conversation.id,
            title: conversation.title,
            icon: <MessageSquare />,
            isActive: conversation.id === conversationId,
            onClick: () => openConversation(conversation.id),
          })),
        },
      ]}
      topBar={
        <>
          <AppBreadcrumbs app="AI Chatbot" page={active?.title ?? "New chat"} className="min-w-0" />
          <div className="ml-auto flex items-center gap-1">
            {active && <ConversationMenu conversation={active} onDeleted={() => openConversation()} />}
            <UserMenu />
          </div>
        </>
      }
    >
      <div className="flex h-[calc(100svh-3rem)] flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto">
          {showEmptyState ? <EmptyChat /> : <MessageList messages={messages} loading={detail.isLoading} />}
        </div>
        <ChatComposer />
      </div>
    </MyUiSidebarLayout>
  );
};
