import { Injectable } from "@nestjs/common";
import type { User } from "@prisma-app/client";
import { PrismaService } from "../prisma.service.js";

type NewUser = Pick<User, "name" | "email" | "passwordHash">;

// Data access for user accounts
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewUser): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  setAvatarKey(id: string, avatarKey: string | null): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { avatarKey } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Names are unique ignoring case: the chat identifies people by name
  async nameTaken(name: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
    return user !== null;
  }
}
