import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { avatarApiPath, userAvatarUrl } from "@/lib/avatar-url";

export const useAvatarSrc = (name: string, imageUrl?: string | null) => {
  const directSrc = useMemo(() => userAvatarUrl(name, imageUrl), [imageUrl, name]);
  const [src, setSrc] = useState(directSrc);

  useEffect(() => {
    setSrc(directSrc);

    const apiPath = avatarApiPath(imageUrl);
    if (!apiPath?.includes("/profile/avatars/")) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    void apiClient.getBlob(apiPath).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data.size > 0 && res.data.type.startsWith("image/")) {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [directSrc, imageUrl, name]);

  return src;
};
