import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ImageParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("all", { message: "Invalid image id" })
  id!: string;
}
