import type { KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { MyUiButton, useAppForm } from "my-ui";
import { useChatStream } from "@/features/chat/api/hooks";
import { useChatStreamStore } from "@/features/chat/store/chat-stream-store";

// Enter sends, Shift+Enter adds a line; while a reply streams the button stops it
export const ChatComposer = () => {
  const chat = useChatStream();
  const isStreaming = useChatStreamStore((state) => state.streamingText !== null);

  const form = useAppForm({
    defaultValues: { message: "" },
    // Keeps Send disabled for blank messages
    validators: { onChange: ({ value }) => (value.message.trim() ? undefined : "Type a message") },
    onSubmit: ({ value, formApi }) => {
      if (isStreaming) return;
      formApi.reset();
      void chat.send(value.message.trim());
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void form.handleSubmit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <form.AppForm>
        <form.Form className="flex items-end gap-2">
          <form.AppField name="message">
            {(field) => (
              <field.TextareaField
                aria-label="Message"
                placeholder="Message the AI…"
                rows={1}
                maxLength={8000}
                onKeyDown={onKeyDown}
                className="flex-1 [&_textarea]:max-h-48 [&_textarea]:min-h-11 [&_textarea]:resize-none"
              />
            )}
          </form.AppField>
          {isStreaming ? (
            <MyUiButton type="button" size="icon" className="mb-0.5 rounded-full" aria-label="Stop" onClick={chat.stop}>
              <Square className="fill-current" />
            </MyUiButton>
          ) : (
            <form.SubmitButton size="icon" className="mb-0.5 rounded-full" aria-label="Send">
              <ArrowUp />
            </form.SubmitButton>
          )}
        </form.Form>
      </form.AppForm>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Answers come from a small local model and can be wrong.
      </p>
    </div>
  );
};
