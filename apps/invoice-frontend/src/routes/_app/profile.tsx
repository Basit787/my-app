import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/invoices/profile-page";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });
