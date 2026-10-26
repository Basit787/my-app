import { PORTS } from "ports";
import { defineAppConfig } from "vite-config";

export default defineAppConfig({ port: PORTS.imageUpload.frontend, api: "imageUpload" });
