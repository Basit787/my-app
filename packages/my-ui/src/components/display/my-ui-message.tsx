import type { ReactNode } from "react";
import { Bubble, BubbleContent } from "my-ui/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "my-ui/ui/message";

type MyUiMessageProps = {
  children: ReactNode;
  // "end" for the current user's own messages
  align?: "start" | "end";
  avatar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

// Chat message: avatar, optional name/time, and the text in a bubble
export function MyUiMessage({ children, align = "start", avatar, header, footer, className }: MyUiMessageProps) {
  return (
    <Message align={align} className={className}>
      {avatar && <MessageAvatar>{avatar}</MessageAvatar>}
      <MessageContent>
        {header && <MessageHeader>{header}</MessageHeader>}
        <Bubble align={align}>
          <BubbleContent>{children}</BubbleContent>
        </Bubble>
        {footer && <MessageFooter>{footer}</MessageFooter>}
      </MessageContent>
    </Message>
  );
}
