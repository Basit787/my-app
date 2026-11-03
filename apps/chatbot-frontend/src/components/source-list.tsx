import { FileText } from "lucide-react";
import { MyUiBadge, MyUiHoverCard } from "my-ui";
import type { Source } from "@/features/chat/api/api";

type SourceListProps = { sources: Source[] };

export const SourceList = ({ sources }: SourceListProps) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((source, index) => (
        <MyUiHoverCard
          key={`${source.documentId}-${index}`}
          className="max-h-72 w-96 overflow-y-auto"
          content={<p className="text-xs whitespace-pre-wrap">{source.excerpt}</p>}
        >
          <MyUiBadge variant="outline" icon={<FileText />} className="cursor-default">
            [{index + 1}] {source.fileName}
          </MyUiBadge>
        </MyUiHoverCard>
      ))}
    </div>
  );
};
