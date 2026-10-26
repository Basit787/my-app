import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SlugParamDto {
  @ApiProperty({ example: "abc123" })
  @IsString()
  slug!: string;
}
