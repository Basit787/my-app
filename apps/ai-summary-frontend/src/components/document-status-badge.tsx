import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { MyUiBadge } from "my-ui";
import type { SummaryDocument } from "@/features/documents/api/api";

type DocumentStatusBadgeProps = { status: SummaryDocument["status"] };

export const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  if (status === "COMPLETED") {
    return <MyUiBadge icon={<CircleCheck />}>Summarized</MyUiBadge>;
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
      {status === "PROCESSING" ? "Summarizing" : "Queued"}
    </MyUiBadge>
  );
};
