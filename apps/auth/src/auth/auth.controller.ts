import { CurrentUser, Public, type AuthUser } from "@app/common";
import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service.js";
import { AuthUserDto } from "./dto/auth-user.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { SignInReplyDto } from "./dto/sign-in-reply.dto.js";

// Sign-in for every app: register or log in for a JWT, then send it as "Authorization: Bearer <token>"
@ApiTags("Auth")
@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiCreatedResponse({ type: SignInReplyDto })
  register(@Body() body: RegisterDto): Promise<SignInReplyDto> {
    return this.auth.register(body);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOkResponse({ type: SignInReplyDto })
  login(@Body() body: LoginDto): Promise<SignInReplyDto> {
    return this.auth.login(body);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: AuthUser): Promise<AuthUserDto> {
    return this.auth.me(user.id);
  }
}
