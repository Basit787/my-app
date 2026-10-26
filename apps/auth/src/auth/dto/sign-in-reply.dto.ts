import { ApiProperty } from "@nestjs/swagger";
import { AuthUserDto } from "./auth-user.dto.js";

// Reply of register and login: the client sends `token` as "Authorization: Bearer <token>" to every API
export class SignInReplyDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiJ9…" })
  token!: string;

  @ApiProperty({ description: "When the token expires (epoch milliseconds)", example: 1767225600000 })
  expiresAt!: number;
}
