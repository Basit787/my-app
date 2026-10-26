import { appConfig, type AppConfig } from "@app/common";
import { UserRepository, type User } from "@app/db";
import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { signAccessToken } from "backend-common";
import type { AuthUserDto } from "./dto/auth-user.dto.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { SignInReplyDto } from "./dto/sign-in-reply.dto.js";
import { hashPassword } from "./utils/hash-password.js";
import { toAuthUserDto } from "./utils/to-auth-user-dto.js";
import { verifyPassword } from "./utils/verify-password.js";

// One message for an unknown email and a wrong password, so neither can be probed
const invalidCredentials = () => new UnauthorizedException("Invalid email or password");

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  async register({ name, email, password }: RegisterDto): Promise<SignInReplyDto> {
    if (await this.users.findByEmail(email)) throw new ConflictException("An account with this email already exists");
    if (await this.users.nameTaken(name)) throw new ConflictException("This name is already taken");
    const user = await this.users.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    });
    return this.signIn(user);
  }

  async login({ email, password }: LoginDto): Promise<SignInReplyDto> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      // Same work as a real check, so an unknown email answers as slowly as a wrong password
      await hashPassword(password);
      throw invalidCredentials();
    }
    if (!(await verifyPassword(password, user.passwordHash))) throw invalidCredentials();
    return this.signIn(user);
  }

  // The account behind a verified token; gone (deleted) means signed out
  async me(userId: string): Promise<AuthUserDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException("Authentication required");
    return toAuthUserDto(user);
  }

  private async signIn(user: User): Promise<SignInReplyDto> {
    const dto = toAuthUserDto(user);
    const { token, expiresAt } = await signAccessToken(
      { id: dto.id, username: dto.name, email: dto.email, role: dto.role },
      this.config.tokenTtlSeconds,
    );
    return { user: dto, token, expiresAt };
  }
}
