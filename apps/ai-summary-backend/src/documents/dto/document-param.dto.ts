import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class DocumentParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  documentId!: string;
}
