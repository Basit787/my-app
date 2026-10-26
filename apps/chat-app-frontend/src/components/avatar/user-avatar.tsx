import { Avatar, AvatarFallback, AvatarImage } from "my-ui";
import { cn } from "@/lib/utils";
import { useAvatarSrc } from "@/lib/use-avatar-src";
import { getAvatarColor, getInitials } from "frontend-common";
import { presenceStatusColor } from "@/lib/presence";
import type { UserStatus } from "@/features/chat/store/chat-store";

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  avatarClassName?: string;
  fallbackClassName?: string;
  showOnline?: boolean;
  online?: boolean;
  status?: UserStatus;
};

export const UserAvatar = ({
  name,
  imageUrl,
  className,
  avatarClassName,
  fallbackClassName,
  showOnline,
  online,
  status,
}: UserAvatarProps) => {
  const src = useAvatarSrc(name, imageUrl);
  const resolvedStatus: UserStatus | undefined = showOnline
    ? (status ?? (online === false ? "offline" : online === true ? "online" : undefined))
    : undefined;

  return (
    <div className={cn("relative h-10 w-10 shrink-0", className)}>
      <Avatar className={cn("h-full w-full", avatarClassName)}>
        <AvatarImage src={src} alt={name} className="object-cover" />
        <AvatarFallback className={cn("text-xs text-white", getAvatarColor(name), fallbackClassName)}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {resolvedStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
            presenceStatusColor(resolvedStatus),
          )}
        />
      )}
    </div>
  );
};
