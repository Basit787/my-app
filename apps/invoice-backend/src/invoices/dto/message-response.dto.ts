import { ApiProperty } from "@nestjs/swagger";

export class MessageResponseDto {
  @ApiProperty({ example: "Invoice deleted successfully." })
  message!: string;
}
