import { ApiProperty } from "@nestjs/swagger";
import { EditPlacementDto } from "./edit-placement.dto.js";
import { PageSizeDto } from "./page-size.dto.js";

// How the current values are drawn onto the original file, for the live preview
export class EditPlanDto {
  @ApiProperty({ description: "false: the original can't be edited (see reason); downloads are generated instead" })
  supported!: boolean;

  @ApiProperty({ type: String, nullable: true, example: "Read the invoice again to edit the original" })
  reason!: string | null;

  @ApiProperty({ type: [PageSizeDto] })
  pages!: PageSizeDto[];

  @ApiProperty({ type: [EditPlacementDto] })
  placements!: EditPlacementDto[];

  @ApiProperty({ type: [String], description: "Changes that could not be placed on the original" })
  unplaced!: string[];
}
