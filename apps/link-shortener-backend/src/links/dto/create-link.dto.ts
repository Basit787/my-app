import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsISO8601, IsOptional, IsString, IsUrl, Matches, MaxLength } from "class-validator";
import { SLUG_PATTERN } from "../utils/slug-pattern.js";
import { trim } from "../utils/trim.js";

export class CreateLinkDto {
  @ApiProperty({ format: "uri", example: "https://example.com/a/very/long/path" })
  @Transform(trim)
  @IsUrl({ protocols: ["http", "https"], require_protocol: true, require_tld: false }, { message: "Enter a valid URL" })
  url!: string;

  @ApiPropertyOptional({ description: "Custom short path; random when omitted", example: "my-link" })
  @IsOptional()
  @Matches(SLUG_PATTERN, { message: "Use 3–64 letters, digits, - or _" })
  slug?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsISO8601({ strict: true })
  expiresAt?: string;
}
