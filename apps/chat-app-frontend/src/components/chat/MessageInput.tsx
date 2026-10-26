import { useRef, useState } from "react";
import { Mic, Paperclip, Send, Smile, Square, Trash2, X } from "lucide-react";
import { Input, Button } from "my-ui";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { useUploadFile } from "@/features/chat/api/hooks";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";
import { toastError } from "@/lib/toast";
import { formatReplyText, messagePreview } from "@/lib/messages";
import { cn } from "@/lib/utils";

const formatRecordingTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MAX_RECORDING_SECONDS = 300;

export const MessageInput = () => {
  const { socket, room } = useChatRoom();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTo = useChatStore((s) => s.replyTo);
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const upload = useUploadFile(room);
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket) return;
    const payload = replyTo ? formatReplyText(replyTo, trimmed) : trimmed;
    socket.emit("message", { room, text: payload });
    setText("");
    setReplyTo(null);
    setEmojiOpen(false);
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setText((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    socket?.emit("typing", { room });

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape") setEmojiOpen(false);
  };

  const uploadVoiceOrFile = async (file: File) => {
    setUploading(true);
    try {
      await upload.mutateAsync({ file });
    } catch {
      // Error toast handled by useUploadFile hook
    } finally {
      setUploading(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    await uploadVoiceOrFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMicClick = async () => {
    if (uploading) return;

    if (isRecording) {
      try {
        const file = await stopRecording();
        if (file) await uploadVoiceOrFile(file);
      } catch (error) {
        toastError(error, "Could not send voice note");
      }
      return;
    }

    try {
      await startRecording();
    } catch (error) {
      toastError(error, "Microphone access denied");
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };

  const handleSendRecording = async () => {
    if (!isRecording || uploading) return;
    try {
      const file = await stopRecording();
      if (file) await uploadVoiceOrFile(file);
    } catch (error) {
      toastError(error, "Could not send voice note");
    }
  };

  return (
    <div className="border-t border-border px-2 py-3 sm:px-5 sm:py-4">
      {replyTo && (
        <div className="mb-3 flex items-start justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">Replying to {replyTo.user}</p>
            <p className="truncate text-xs text-muted-foreground">{messagePreview(replyTo)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setReplyTo(null)}
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="mb-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-destructive">Recording voice note</p>
              <p className="text-xs tabular-nums text-muted-foreground">{formatRecordingTime(duration)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground"
              onClick={handleCancelRecording}
              aria-label="Cancel recording"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => void handleSendRecording()}
              disabled={uploading || duration < 0.5}
              aria-label="Send voice note"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-destructive/15">
            <div
              className="h-full rounded-full bg-destructive transition-[width] duration-100 ease-linear"
              style={{ width: `${Math.min(100, (duration / MAX_RECORDING_SECONDS) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full text-muted-foreground"
          disabled={uploading || isRecording}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0 rounded-full",
            isRecording ? "bg-destructive/15 text-destructive" : "text-muted-foreground",
          )}
          disabled={uploading}
          onClick={() => void handleMicClick()}
          aria-label={isRecording ? "Stop recording" : "Record voice note"}
        >
          {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />}
        </Button>

        <div className="relative min-w-0 flex-1">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              socket?.emit("typing", { room });
            }}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording…" : "Type a message..."}
            disabled={isRecording}
            className="h-11 rounded-2xl bg-input pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2",
              emojiOpen ? "text-primary" : "text-muted-foreground",
            )}
            aria-label="Emoji"
            aria-expanded={emojiOpen}
            disabled={isRecording}
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onSelect={insertEmoji} />
        </div>

        <Button
          type="button"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onClick={sendMessage}
          disabled={!text.trim() || isRecording}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
