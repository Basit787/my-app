import { useEffect, useMemo } from "react";

// An object URL for a blob, revoked when the blob changes or the component unmounts
export const useObjectUrl = (blob: Blob | undefined): string | null => {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return url;
};
