import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsOptional } from "class-validator";

// Multipart body of POST /images: one image under `file`, optionally published later at `scheduledAt`
export class UploadImageDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;

  @ApiPropertyOptional({ format: "date-time", description: "Publish later (future time)" })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: "Must be an ISO date-time" })
  scheduledAt?: string;
}
