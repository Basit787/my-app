import { CurrentUser, dmRoomsMatch, OkResponseDto, ROLES, type AuthUser } from "@app/common";
import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RoomAccessService } from "../groups/room-access.service.js";
import { RealtimeService } from "@app/realtime";
import { MessageParamDto, MessagesResponseDto, RoomParamDto } from "./dto/message.dto.js";
import { MessagesService } from "./messages.service.js";

@ApiTags("Messages")
@ApiBearerAuth()
@Controller("rooms")
export class MessagesController {
  constructor(
    private readonly messages: MessagesService,
    private readonly roomAccess: RoomAccessService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get(":room/messages")
  @ApiOkResponse({ type: MessagesResponseDto })
  async list(@Param() { room }: RoomParamDto, @CurrentUser() user: AuthUser): Promise<MessagesResponseDto> {
    if (!(await this.roomAccess.canAccess(room, user.username))) throw new ForbiddenException("Forbidden");
    return { messages: (await this.messages.getRoomMessages(room, user.username)) as MessagesResponseDto["messages"] };
  }

  // Soft delete for everyone; only the sender or an admin may do it
  @Delete(":room/messages/:id")
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Param() { room, id }: MessageParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.roomAccess.canAccess(room, user.username))) throw new ForbiddenException("Forbidden");
    const message = await this.messages.getMessageById(id);
    if (!message || (!dmRoomsMatch(message.room, room) && message.room !== room)) {
      throw new NotFoundException("Message not found");
    }
    if (message.deleted) throw new BadRequestException("Message already deleted");
    if (message.user !== user.username && user.role !== ROLES.ADMIN) throw new ForbiddenException("Forbidden");

    const updated = await this.messages.softDelete(id);
    if (!updated) throw new NotFoundException("Message not found");
    await this.realtime.emitToRoomParticipants(room, "message_deleted", updated);
    return { ok: true };
  }
}
