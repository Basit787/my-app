import { PORTS } from "ports";
import { defineAppConfig } from "vite-config";

// Chat API at /api plus Socket.IO
export default defineAppConfig({ port: PORTS.chatApp.frontend, api: "chatApp", websocket: true });
