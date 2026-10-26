import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, Length } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class RemovePushTokenDto {
  @ApiProperty({ example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" })
  @Transform(trim)
  @IsString()
  @Length(1, 256)
  token!: string;
}

export class RegisterPushTokenDto extends RemovePushTokenDto {
  @ApiPropertyOptional({ enum: ["ios", "android"] })
  @IsOptional()
  @IsIn(["ios", "android"])
  platform?: "ios" | "android";
}
