import { CalendarClock, Images, Trash2 } from "lucide-react";

// The app's three pages, shared by the sidebar and the mobile tab bar
export const IMAGE_VIEWS = [
  { to: "/", label: "Gallery", icon: Images },
  { to: "/scheduled", label: "Scheduled", icon: CalendarClock },
  { to: "/bin", label: "Bin", icon: Trash2 },
] as const;
