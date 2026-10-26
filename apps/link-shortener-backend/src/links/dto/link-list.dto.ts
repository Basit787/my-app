import { ApiProperty } from "@nestjs/swagger";
import { LinkDto } from "./link.dto.js";

export class LinkListDto {
  @ApiProperty({ type: [LinkDto] })
  links!: LinkDto[];
}
