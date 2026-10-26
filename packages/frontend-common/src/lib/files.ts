export type FileCategory = "image" | "video" | "pdf" | "document" | "audio" | "other";

export const getFileCategory = (mimeType: string): FileCategory => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation") ||
    mimeType.includes("text/plain") ||
    mimeType.includes("msword") ||
    mimeType.includes("officedocument")
  ) {
    return "document";
  }
  return "other";
};

export const canPreviewInline = (category: FileCategory) =>
  category === "image" || category === "video" || category === "pdf";
