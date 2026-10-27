import { useEffect, useRef } from "react";
import { MyUiMessage, MyUiSpinner } from "my-ui";
import type { ChatMessage } from "@/features/chat/api/api";
import { useChatStreamStore } from "@/features/chat/store/chat-stream-store";
import { MarkdownContent } from "./markdown-content";

type MessageListProps = {
  messages: ChatMessage[];
  loading?: boolean;
};

// Three jumping dots while the model has not sent its first token
const typingDots = (
  <div role="status" aria-label="Thinking…" className="flex h-6 items-center gap-1 px-1">
    {["0ms", "150ms", "300ms"].map((delay) => (
      <span
        key={delay}
        className="size-2 animate-bounce rounded-full bg-muted-foreground"
        style={{ animationDelay: delay }}
      />
    ))}
  </div>
);

// The user's messages on the right in the primary color; replies on the left in a muted bubble, rendered as Markdown
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
          <MyUiMessage key={message.id} variant="muted">
            <MarkdownContent content={message.content} />
          </MyUiMessage>
        ),
      )}
      {streamingText !== null && (
        <MyUiMessage variant="muted">
          {streamingText ? <MarkdownContent content={streamingText} /> : typingDots}
        </MyUiMessage>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
