import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { PageQueryDto } from "./page-query.dto.js";

// Query of GET /images: one status per page of results
export class ListImagesQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: ["active", "scheduled"], default: "active" })
  @IsOptional()
  @IsIn(["active", "scheduled"])
  status: "active" | "scheduled" = "active";
}
