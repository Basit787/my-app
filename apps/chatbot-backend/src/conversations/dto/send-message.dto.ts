import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, Length } from "class-validator";

export class SendMessageDto {
  @ApiProperty({ minLength: 1, maxLength: 8000, example: "Explain recursion with an example" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(1, 8000)
  content!: string;
}
