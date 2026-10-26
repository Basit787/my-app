import { CurrentUser, OkResponseDto, type AuthUser } from "@app/common";
import { NotificationsService } from "@app/notifications";
import { Body, Controller, Delete, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RegisterPushTokenDto, RemovePushTokenDto } from "./dto/push-token.dto.js";

@ApiTags("Push")
@ApiBearerAuth()
@Controller("push/tokens")
export class PushController {
  constructor(private readonly push: NotificationsService) {}

  // Stores this device's Expo push token for message and incoming-call notifications
  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async register(
    @Body() { token, platform }: RegisterPushTokenDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OkResponseDto> {
    await this.push.register(user.username, token, platform);
    return { ok: true };
  }

  // Called on sign-out so the device stops receiving notifications
  @Delete()
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Body() { token }: RemovePushTokenDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    await this.push.remove(user.username, token);
    return { ok: true };
  }
}
