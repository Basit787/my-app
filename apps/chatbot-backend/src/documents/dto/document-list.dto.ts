import { ApiProperty } from "@nestjs/swagger";
import { DocumentDto } from "./document.dto.js";

export class DocumentListDto {
  @ApiProperty({ type: [DocumentDto] })
  documents!: DocumentDto[];
}
