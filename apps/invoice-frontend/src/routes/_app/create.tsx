import { createFileRoute } from "@tanstack/react-router";
import { CreateInvoicePage } from "@/features/builder/create-invoice-page";

export const Route = createFileRoute("/_app/create")({ component: CreateInvoicePage });
