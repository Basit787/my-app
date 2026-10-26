import { ApiProperty } from "@nestjs/swagger";

export class DayClicksDto {
  @ApiProperty({ example: "2026-10-26" })
  day!: string;

  @ApiProperty({ example: 4 })
  count!: number;
}
