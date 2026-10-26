import type { Socket } from "socket.io-client";

type Handler = (payload: never) => unknown;
type Listener = (...args: unknown[]) => void;

// Adds several socket listeners at once; the returned function removes them (use it as an effect cleanup)
export const subscribeSocket = (socket: Socket, handlers: Record<string, Handler>) => {
  for (const [event, handler] of Object.entries(handlers)) socket.on(event, handler as Listener);
  return () => {
    for (const [event, handler] of Object.entries(handlers)) socket.off(event, handler as Listener);
  };
};
