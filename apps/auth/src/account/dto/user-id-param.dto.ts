import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class UserIdParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  userId!: string;
}
