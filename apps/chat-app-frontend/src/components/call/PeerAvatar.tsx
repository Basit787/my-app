import { UserAvatar } from "@/components/avatar/user-avatar";
import { useUserProfileImage } from "@/lib/use-user-profile-image";

type PeerAvatarProps = { name: string; className?: string; fallbackClassName?: string };

// A call participant's profile photo
export const PeerAvatar = ({ name, ...sizing }: PeerAvatarProps) => (
  <UserAvatar name={name} imageUrl={useUserProfileImage(name)} {...sizing} />
);
