import { serviceUrl } from "ports";
import { Bot, FileText, Images, Link2, ReceiptText, type LucideIcon } from "lucide-react";

export type AppEntry = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
};

// Every project reachable from home; add new apps here
export const APPS: AppEntry[] = [
  {
    id: "link-shortener",
    name: "Link Shortener",
    description: "Create short links and track their clicks.",
    url: serviceUrl("linkShortener", "frontend"),
    icon: Link2,
  },
  {
    id: "image-upload",
    name: "Image Upload",
    description: "Upload, browse and delete your images.",
    url: serviceUrl("imageUpload", "frontend"),
    icon: Images,
  },
  {
    id: "chatbot",
    name: "AI Chatbot",
    description: "Chat with a local AI model; your conversations are saved.",
    url: serviceUrl("chatbot", "frontend"),
    icon: Bot,
  },
  {
    id: "ai-summary",
    name: "AI Summary",
    description: "Upload text documents and get summaries from a local AI model.",
    url: serviceUrl("aiSummary", "frontend"),
    icon: FileText,
  },
  {
    id: "invoices",
    name: "Invoices",
    description: "Upload invoices (PDF, scans, XML) and review the data read with OCR.",
    url: serviceUrl("invoices", "frontend"),
    icon: ReceiptText,
  },
];
