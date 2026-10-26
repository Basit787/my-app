import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { MyUiMessage, MyUiSpinner } from "my-ui";
import type { ChatMessage } from "@/features/chat/api/api";
import { useChatStreamStore } from "@/features/chat/store/chat-stream-store";
import { MarkdownContent } from "./markdown-content";

type MessageListProps = {
  messages: ChatMessage[];
  loading?: boolean;
};

const botAvatar = (
  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
    <Bot className="size-4" />
  </div>
);

// The user's messages on the right; replies on the left with the bot avatar, rendered as Markdown
export const MessageList = ({ messages, loading }: MessageListProps) => {
  const streamingText = useChatStreamStore((state) => state.streamingText);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Follow the conversation as messages and streamed text arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, streamingText]);

  if (loading) return <MyUiSpinner label="Loading chat…" className="m-auto" />;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      {messages.map((message) =>
        message.role === "user" ? (
          <MyUiMessage key={message.id} align="end">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </MyUiMessage>
        ) : (
          <MyUiMessage key={message.id} avatar={botAvatar}>
            <MarkdownContent content={message.content} />
          </MyUiMessage>
        ),
      )}
      {streamingText !== null && (
        <MyUiMessage avatar={botAvatar}>
          {streamingText ? <MarkdownContent content={streamingText} /> : <MyUiSpinner label="Thinking…" />}
        </MyUiMessage>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
