import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@chat.local" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Admin123!" })
  @IsString()
  @MaxLength(128)
  password!: string;
}
