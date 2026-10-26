import { ApiProperty } from "@nestjs/swagger";

// The signed-in user, as every app shows it
export class AuthUserDto {
  @ApiProperty({ example: "6650f1c2a1b2c3d4e5f60708" })
  id!: string;

  @ApiProperty({ example: "alice" })
  name!: string;

  @ApiProperty({ example: "alice@chat.local" })
  email!: string;

  @ApiProperty({ enum: ["user", "admin"] })
  role!: "user" | "admin";

  @ApiProperty({ example: "/avatars/6650f1c2a1b2c3d4e5f60708?v=1729071234567", description: "Empty when none" })
  image!: string;
}
