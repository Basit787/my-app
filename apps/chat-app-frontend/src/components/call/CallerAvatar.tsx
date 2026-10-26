import { GroupAvatar } from "@/components/avatar/group-avatar";
import type { ChatGroup } from "@/features/chat/api/api";
import { PeerAvatar } from "./PeerAvatar";

type CallerAvatarProps = { name: string; group?: ChatGroup; className?: string; fallbackClassName?: string };

// The group's photo for group calls, otherwise the other person's
export const CallerAvatar = ({ group, name, ...sizing }: CallerAvatarProps) =>
  group ? (
    <GroupAvatar groupId={group.id} name={group.name} imageUrl={group.image} {...sizing} />
  ) : (
    <PeerAvatar name={name} {...sizing} />
  );
