import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UploadFileDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;

  @ApiPropertyOptional({ description: "Text sent with the file", maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;
}
