import { createFileRoute } from "@tanstack/react-router";
import { BinView } from "@/features/images/bin-view";

export const Route = createFileRoute("/_app/bin")({ component: BinView });
