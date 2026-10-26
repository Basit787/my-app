import { MAX_ROOM_LENGTH, type ChatMessageDto, type MessageFileDto } from "@app/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsMongoId, IsString, Length } from "class-validator";

export class RoomParamDto {
  @ApiProperty({ example: "general", description: "general, dm..<a>..<b> or group..<id>" })
  @IsString()
  @Length(1, MAX_ROOM_LENGTH)
  room!: string;
}

export class MessageParamDto extends RoomParamDto {
  @IsMongoId()
  id!: string;
}

export class MessageFileResponseDto implements MessageFileDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: "document.pdf" }) name!: string;
  @ApiProperty({ example: "application/pdf" }) mimeType!: string;
  @ApiProperty({ example: 102400 }) size!: number;
}

export class MessageResponseDto implements ChatMessageDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: "general" }) room!: string;
  @ApiProperty({ example: "alex" }) user!: string;
  @ApiProperty({ example: "Hello!" }) text!: string;
  @ApiProperty({ enum: ["text", "file"] }) type!: "text" | "file";
  @ApiPropertyOptional({ type: MessageFileResponseDto }) file?: MessageFileResponseDto;
  @ApiPropertyOptional() deleted?: boolean;
  @ApiPropertyOptional({ enum: ["sent", "delivered", "read"], description: "Only on your own messages" })
  status?: "sent" | "delivered" | "read";
  @ApiProperty({ format: "date-time" }) at!: string;
}

export class MessagesResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  messages!: MessageResponseDto[];
}
