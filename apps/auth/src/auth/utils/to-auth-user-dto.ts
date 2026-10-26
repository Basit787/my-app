import type { User } from "@app/db";
import type { AuthUserDto } from "../dto/auth-user.dto.js";

export const toAuthUserDto = (user: User): AuthUserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  // Relative to the auth API; the version busts caches after a change
  image: user.avatarKey ? `/avatars/${user.id}?v=${user.updatedAt.getTime()}` : "",
});
