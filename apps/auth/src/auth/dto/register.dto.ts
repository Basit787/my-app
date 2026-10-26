import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, Matches } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "alice", description: "Username shown in every app; letters, digits, - or _" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @Matches(/^[a-zA-Z0-9_-]{2,32}$/, { message: "Use 2–32 letters, digits, - or _" })
  name!: string;

  @ApiProperty({ example: "alice@chat.local" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Alice123!", minLength: 8 })
  @IsString()
  @Length(8, 128)
  password!: string;
}
