import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsISO8601, IsOptional, IsString, IsUrl, Matches, MaxLength, ValidateIf } from "class-validator";
import { SLUG_PATTERN } from "../utils/slug-pattern.js";
import { trim } from "../utils/trim.js";

export class UpdateLinkDto {
  @ApiPropertyOptional({ format: "uri" })
  @IsOptional()
  @Transform(trim)
  @IsUrl({ protocols: ["http", "https"], require_protocol: true, require_tld: false }, { message: "Enter a valid URL" })
  url?: string;

  @ApiPropertyOptional({ description: "Custom short path" })
  @IsOptional()
  @Matches(SLUG_PATTERN, { message: "Use 3–64 letters, digits, - or _" })
  slug?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  title?: string;

  // null clears the expiry
  @ApiPropertyOptional({ type: String, format: "date-time", nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsISO8601({ strict: true })
  expiresAt?: string | null;
}
