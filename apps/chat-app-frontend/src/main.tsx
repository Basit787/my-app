import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
// Registers the first-tap listener that unlocks call ringtones on mobile
import "@/lib/call-sounds";

const router = getRouter();
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
