import type { ReactNode } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "my-ui/ui/avatar";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

type MyUiAvatarProps = {
  name: string;
  src?: string;
  size?: "default" | "sm" | "lg";
  // Small dot or icon in the corner, e.g. online status
  badge?: ReactNode;
  className?: string;
};

// Image with initials fallback
export function MyUiAvatar({ name, src, size, badge, className }: MyUiAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
      {badge && <AvatarBadge>{badge === true ? null : badge}</AvatarBadge>}
    </Avatar>
  );
}

type MyUiAvatarGroupProps = {
  users: { name: string; src?: string }[];
  // Avatars shown before "+N"
  max?: number;
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function MyUiAvatarGroup({ users, max = 4, size, className }: MyUiAvatarGroupProps) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <AvatarGroup className={className}>
      {shown.map((user, index) => (
        <MyUiAvatar key={`${user.name}-${index}`} name={user.name} src={user.src} size={size} />
      ))}
      {rest > 0 && <AvatarGroupCount>+{rest}</AvatarGroupCount>}
    </AvatarGroup>
  );
}
