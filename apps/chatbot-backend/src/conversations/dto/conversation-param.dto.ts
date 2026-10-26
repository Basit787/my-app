import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ConversationParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  id!: string;
}
