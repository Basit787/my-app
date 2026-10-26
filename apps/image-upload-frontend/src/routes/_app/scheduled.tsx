import { createFileRoute } from "@tanstack/react-router";
import { ScheduledView } from "@/features/images/scheduled-view";

export const Route = createFileRoute("/_app/scheduled")({ component: ScheduledView });
