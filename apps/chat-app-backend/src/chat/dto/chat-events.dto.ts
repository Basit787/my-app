import { MAX_ROOM_LENGTH, type PresenceStatus } from "@app/common";
import { IsIn, IsMongoId, IsString, Length } from "class-validator";

// Socket payloads for chat events (validated by the gateway's ValidationPipe)

export class RoomPayloadDto {
  @IsString()
  @Length(1, MAX_ROOM_LENGTH)
  room!: string;
}

export class SendMessageDto extends RoomPayloadDto {
  @IsString()
  @Length(1, 2000)
  text!: string;
}

export class ReceiptDto extends RoomPayloadDto {
  @IsMongoId()
  messageId!: string;
}

export class StatusDto {
  @IsIn(["online", "away", "busy", "offline"])
  status!: PresenceStatus;
}
