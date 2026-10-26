import { MAX_ROOM_LENGTH, type CallType } from "@app/common";
import { IsIn, IsObject, IsString, Length } from "class-validator";

const CALL_TYPES: CallType[] = ["audio", "video"];

// Socket payloads for 1:1 and group call signaling (validated by the gateway's ValidationPipe)

export class SignalTargetDto {
  @IsString()
  @Length(1, 32)
  to!: string;
}

export class InviteDto extends SignalTargetDto {
  @IsIn(CALL_TYPES)
  callType!: CallType;
}

export class SdpDto extends SignalTargetDto {
  @IsObject()
  sdp!: Record<string, unknown>;
}

export class IceCandidateDto extends SignalTargetDto {
  @IsObject()
  candidate!: Record<string, unknown>;
}

export class GroupRoomDto {
  @IsString()
  @Length(1, MAX_ROOM_LENGTH)
  room!: string;
}

export class GroupStartDto extends GroupRoomDto {
  @IsIn(CALL_TYPES)
  callType!: CallType;
}

export class GroupSdpDto extends GroupRoomDto {
  @IsString()
  @Length(1, 32)
  to!: string;

  @IsObject()
  sdp!: Record<string, unknown>;
}

export class GroupIceCandidateDto extends GroupRoomDto {
  @IsString()
  @Length(1, 32)
  to!: string;

  @IsObject()
  candidate!: Record<string, unknown>;
}
