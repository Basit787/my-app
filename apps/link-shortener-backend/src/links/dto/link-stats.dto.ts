import { ApiProperty } from "@nestjs/swagger";
import { DayClicksDto } from "./day-clicks.dto.js";

// Click stats for one link
export class LinkStatsDto {
  @ApiProperty({ format: "uuid" })
  linkId!: string;

  @ApiProperty({ example: 42 })
  totalClicks!: number;

  // Last 30 days, one entry per day
  @ApiProperty({ type: [DayClicksDto] })
  days!: DayClicksDto[];
}
