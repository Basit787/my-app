import type { SocketUser } from "./socket.js";

declare module "socket.io" {
  interface SocketData {
    user: SocketUser;
  }
}
