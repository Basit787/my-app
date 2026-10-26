import { Avatar, AvatarFallback, AvatarImage } from "my-ui";
import { cn } from "@/lib/utils";
import { groupAvatarUrl } from "@/lib/avatar-url";
import { getAvatarColor, getInitials } from "frontend-common";

type GroupAvatarProps = {
  groupId: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export const GroupAvatar = ({ groupId, name, imageUrl, className, fallbackClassName }: GroupAvatarProps) => {
  const src = imageUrl ? groupAvatarUrl(groupId, imageUrl) : undefined;

  return (
    <div className={cn("relative h-10 w-10 shrink-0", className)}>
      <Avatar className="h-full w-full">
        {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
        <AvatarFallback className={cn("text-xs text-white", getAvatarColor(name), fallbackClassName)}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
