import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { MyUiBadge } from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";

type InvoiceStatusBadgeProps = { status: Invoice["status"] };

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  if (status === "COMPLETED") {
    return <MyUiBadge icon={<CircleCheck />}>Read</MyUiBadge>;
  }
  if (status === "FAILED") {
    return (
      <MyUiBadge variant="destructive" icon={<CircleAlert />}>
        Failed
      </MyUiBadge>
    );
  }
  return (
    <MyUiBadge variant="secondary" icon={<Loader2 className="animate-spin" />}>
      {status === "PROCESSING" ? "Reading" : "Queued"}
    </MyUiBadge>
  );
};
