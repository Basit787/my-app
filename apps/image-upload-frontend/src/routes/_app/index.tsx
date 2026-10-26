import { createFileRoute } from "@tanstack/react-router";
import { GalleryView } from "@/features/images/gallery-view";

export const Route = createFileRoute("/_app/")({ component: GalleryView });
