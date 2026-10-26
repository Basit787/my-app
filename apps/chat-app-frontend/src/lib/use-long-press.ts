import { useRef } from "react";

export const useLongPress = (onLongPress: (x: number, y: number) => void, delay = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const start = (x: number, y: number) => {
    positionRef.current = { x, y };
    timerRef.current = setTimeout(() => {
      onLongPress(positionRef.current.x, positionRef.current.y);
    }, delay);
  };

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return { start, clear };
};
