import type { CallHistoryDto, IceServerDto, WebRTCConfigResponse } from "@app/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class CallHistoryQueryDto {
  @ApiPropertyOptional({ description: "Only calls with this user" })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  peer?: string;
}

export class CallHistoryEntryDto implements CallHistoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() caller!: string;
  @ApiProperty() callee!: string;
  @ApiProperty({ enum: ["audio", "video"] }) callType!: "audio" | "video";
  @ApiProperty({ enum: ["completed", "missed", "rejected", "cancelled"] })
  status!: "completed" | "missed" | "rejected" | "cancelled";
  @ApiProperty({ format: "date-time" }) startedAt!: string;
  @ApiProperty({ format: "date-time" }) endedAt!: string;
  @ApiPropertyOptional() durationSeconds?: number;
}

export class CallHistoryResponseDto {
  @ApiProperty({ type: [CallHistoryEntryDto] })
  calls!: CallHistoryEntryDto[];
}

class IceServerResponseDto implements IceServerDto {
  @ApiProperty({ example: "turn:localhost:3478" }) urls!: string;
  @ApiPropertyOptional() username?: string;
  @ApiPropertyOptional() credential?: string;
}

export class WebRTCConfigResponseDto implements WebRTCConfigResponse {
  @ApiProperty({ type: [IceServerResponseDto] })
  iceServers!: IceServerResponseDto[];
}
