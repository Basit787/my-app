import { MyUiChart, MyUiDialog, MyUiSkeleton } from "my-ui";
import type { LinkDto } from "@/features/links/api/api";
import { useLinkStats } from "@/features/links/api/hooks";

type LinkStatsDialogProps = { link: LinkDto | null; onClose: () => void };

export const LinkStatsDialog = ({ link, onClose }: LinkStatsDialogProps) => {
  const stats = useLinkStats(link?.id ?? null);
  return (
    <MyUiDialog
      open={!!link}
      onOpenChange={(open) => !open && onClose()}
      title={link ? `Clicks for /r/${link.slug}` : "Clicks"}
      description={stats.data ? `${stats.data.totalClicks} clicks in total · last 30 days` : "Last 30 days"}
      className="sm:max-w-2xl"
    >
      {stats.data ? (
        <MyUiChart
          type="bar"
          data={stats.data.days.map((d) => ({ day: d.day.slice(5), clicks: d.count }))}
          xKey="day"
          series={[{ key: "clicks", label: "Clicks" }]}
          className="h-64"
        />
      ) : (
        <MyUiSkeleton lines={6} />
      )}
    </MyUiDialog>
  );
};
