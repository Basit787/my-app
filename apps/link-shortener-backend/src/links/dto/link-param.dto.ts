import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// Any string: an id that is not a UUID is simply a link that does not exist (404)
export class LinkParamDto {
  @ApiProperty({ format: "uuid" })
  @IsString()
  id!: string;
}
