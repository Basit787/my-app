import { UserRepository } from "@app/db";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { entityObjectKey, ObjectStorageService, type UploadedFileData } from "backend-common";
import type { AuthUserDto } from "../auth/dto/auth-user.dto.js";
import { toAuthUserDto } from "../auth/utils/to-auth-user-dto.js";
import { verifyPassword } from "../auth/utils/verify-password.js";

const AVATAR_FOLDER = "avatars";

// Profile photo (MinIO) and account deletion
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly users: UserRepository,
    private readonly storage: ObjectStorageService,
  ) {}

  async findAvatarKey(userId: string): Promise<string | null> {
    const user = await this.users.findById(userId);
    return user?.avatarKey ?? null;
  }

  async saveAvatar(userId: string, file: UploadedFileData): Promise<AuthUserDto> {
    const key = entityObjectKey(AVATAR_FOLDER, userId, file.originalname);
    // Drops the old photo when its extension differs
    await this.storage.bucket.deleteByPrefix(`${AVATAR_FOLDER}/${userId}`, key);
    await this.storage.bucket.put(key, file.buffer, file.mimetype);
    this.logger.log(`Avatar saved for user ${userId} (${key})`);
    return toAuthUserDto(await this.users.setAvatarKey(userId, key));
  }

  async removeAvatar(userId: string): Promise<AuthUserDto> {
    await this.storage.bucket.deleteByPrefix(`${AVATAR_FOLDER}/${userId}`);
    this.logger.log(`Avatar removed for user ${userId}`);
    return toAuthUserDto(await this.users.setAvatarKey(userId, null));
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException("Incorrect password");
    }
    await this.storage.bucket.deleteByPrefix(`${AVATAR_FOLDER}/${userId}`);
    await this.users.delete(userId);
    this.logger.log(`Account deleted: user ${userId}`);
  }
}
