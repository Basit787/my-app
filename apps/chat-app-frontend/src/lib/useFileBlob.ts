import { useEffect, useState } from "react";
import { downloadFile } from "@/features/chat/api/api";

const blobCache = new Map<string, string>();

const cacheKey = (room: string, fileId: string) => {
  return `${room}:${fileId}`;
};

export const useFileBlob = (room: string, fileId: string | undefined, enabled = true) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId || !enabled) {
      setBlobUrl(null);
      setError(false);
      return;
    }

    const key = cacheKey(room, fileId);
    const cached = blobCache.get(key);
    if (cached) {
      setBlobUrl(cached);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    downloadFile(room, fileId)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobCache.set(key, url);
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [room, fileId, enabled]);

  return { blobUrl, loading, error };
};

export const downloadFileAsAttachment = async (room: string, fileId: string, filename: string) => {
  const blob = await downloadFile(room, fileId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
