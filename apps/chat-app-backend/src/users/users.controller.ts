import { CurrentUser, GENERAL_ROOM, type AuthUser } from "@app/common";
import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ContactsResponseDto, StatusResponseDto, UpdateStatusDto } from "./dto/profile.dto.js";
import { PresenceService } from "./presence.service.js";
import { UsersService } from "./users.service.js";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly presence: PresenceService,
  ) {}

  @Get("profile/status")
  @ApiOkResponse({ type: StatusResponseDto })
  async status(@CurrentUser() user: AuthUser): Promise<StatusResponseDto> {
    return { status: await this.presence.getStatus(user.username) };
  }

  @Patch("profile/status")
  @ApiOkResponse({ type: StatusResponseDto })
  async updateStatus(@Body() { status }: UpdateStatusDto, @CurrentUser() user: AuthUser): Promise<StatusResponseDto> {
    await this.presence.setStatus(user.username, status);
    await this.presence.broadcast(GENERAL_ROOM);
    return { status };
  }

  @Get("contacts")
  @ApiTags("Contacts")
  @ApiOkResponse({ type: ContactsResponseDto })
  async contacts(@CurrentUser() user: AuthUser): Promise<ContactsResponseDto> {
    return { contacts: await this.users.getContacts(user.username) };
  }
}
