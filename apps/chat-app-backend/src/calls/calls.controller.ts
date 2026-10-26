import { CurrentUser, type AuthUser } from "@app/common";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CallsService } from "./calls.service.js";
import { CallHistoryQueryDto, CallHistoryResponseDto, WebRTCConfigResponseDto } from "./dto/call-history.dto.js";

@ApiTags("Calls")
@ApiBearerAuth()
@Controller()
export class CallsController {
  constructor(private readonly calls: CallsService) {}

  @Get("calls/history")
  @ApiOkResponse({ type: CallHistoryResponseDto })
  async history(
    @Query() { peer }: CallHistoryQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CallHistoryResponseDto> {
    return { calls: await this.calls.getUserHistory(user.username, peer) };
  }

  // STUN/TURN servers (coturn) for WebRTC peer connections
  @Get("webrtc/config")
  @ApiOkResponse({ type: WebRTCConfigResponseDto })
  config(): WebRTCConfigResponseDto {
    return this.calls.iceServers() as WebRTCConfigResponseDto;
  }
}
