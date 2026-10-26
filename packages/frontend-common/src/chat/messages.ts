import type { ChatMessage, MessageFile } from "./types";
import { getFileCategory, type FileCategory } from "../lib/files";

export const DELETED_MESSAGE_LABEL = "This message is deleted";

export const messageKey = (message: ChatMessage) => message.id ?? `${message.room}:${message.at}:${message.user}`;

const MEDIA_LABELS: Partial<Record<FileCategory, { icon: string; name: string }>> = {
  image: { icon: "📷", name: "Photo" },
  video: { icon: "🎥", name: "Video" },
  audio: { icon: "🎤", name: "Voice message" },
};

const mediaLabel = (file: MessageFile) => MEDIA_LABELS[getFileCategory(file.mimeType)];

/**
 * Display name for an attachment. Photos/videos/voice notes get a generic label because their
 * file names are usually meaningless (camera captures are named like "1729071234567.jpg").
 */
export const attachmentTitle = (file: MessageFile) => mediaLabel(file)?.name ?? file.name;

/** Caption typed with an attachment (the server stores the file name as the text when there is none). */
export const attachmentCaption = (message: ChatMessage) =>
  message.file && message.text !== message.file.name ? message.text : undefined;

export const messagePreview = (message: ChatMessage) => {
  if (message.deleted) return DELETED_MESSAGE_LABEL;
  if (message.type !== "file" || !message.file) return message.text;

  const icon = mediaLabel(message.file)?.icon ?? "📄";
  return `${icon} ${attachmentCaption(message) ?? attachmentTitle(message.file)}`;
};

export const formatReplyText = (replyTo: ChatMessage, text: string) =>
  `↩ ${replyTo.user}: ${messagePreview(replyTo)}\n${text}`;

export const formatForwardText = (message: ChatMessage) => {
  if (message.type === "file") {
    return `↪ ${messagePreview(message)}`;
  }
  return `↪ ${message.text}`;
};

export const messagesCopyText = (messages: ChatMessage[]) =>
  messages.map((message) => messagePreview(message)).join("\n\n");
