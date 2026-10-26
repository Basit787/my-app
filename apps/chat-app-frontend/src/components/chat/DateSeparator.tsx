import { format, isToday, isYesterday } from "date-fns";
import { Marker, MarkerContent } from "my-ui";

// "Today" / "Yesterday" / full date line between days
type DateSeparatorProps = {
  date: string;
};

export const DateSeparator = ({ date }: DateSeparatorProps) => {
  const d = new Date(date);
  let label = format(d, "MMMM d, yyyy");
  if (isToday(d)) label = "Today";
  else if (isYesterday(d)) label = "Yesterday";

  return (
    <Marker variant="separator" className="py-3 text-[11px]">
      <MarkerContent>{label}</MarkerContent>
    </Marker>
  );
};
