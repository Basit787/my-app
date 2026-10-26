import { useEffect, useRef } from "react";

// A ref that always holds the latest value, for socket handlers that must not re-subscribe on every change
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
