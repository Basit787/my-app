import type { ComponentProps, ReactNode } from "react";
import { Bubble, BubbleContent } from "my-ui/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "my-ui/ui/message";

type MyUiMessageProps = {
  children: ReactNode;
  // "end" for the current user's own messages
  align?: "start" | "end";
  // Bubble color: "default" (primary), "muted", "secondary", "tinted", …
  variant?: ComponentProps<typeof Bubble>["variant"];
  avatar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

// Chat message: avatar, optional name/time, and the text in a bubble
export function MyUiMessage({ children, align = "start", variant, avatar, header, footer, className }: MyUiMessageProps) {
  return (
    <Message align={align} className={className}>
      {avatar && <MessageAvatar>{avatar}</MessageAvatar>}
      <MessageContent>
        {header && <MessageHeader>{header}</MessageHeader>}
        <Bubble align={align} variant={variant}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
        {footer && <MessageFooter>{footer}</MessageFooter>}
      </MessageContent>
    </Message>
  );
}
