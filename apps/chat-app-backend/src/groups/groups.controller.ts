import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateGroupDto, GroupParamDto, GroupResponseDto, GroupsResponseDto, UpdateGroupDto } from "./dto/group.dto.js";
import {
  CurrentUser,
  Public,
  ImageResponseDto,
  OkResponseDto,
  type AuthUser,
  type UploadedFileData,
} from "@app/common";
import { StorageService } from "@app/storage";
import { GroupsService } from "./groups.service.js";

@ApiTags("Groups")
@ApiBearerAuth()
@Controller("groups")
export class GroupsController {
  constructor(
    private readonly groups: GroupsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @ApiOkResponse({ type: GroupsResponseDto })
  async list(@CurrentUser() user: AuthUser): Promise<GroupsResponseDto> {
    return { groups: await this.groups.listForUser(user.username) };
  }

  @Post()
  create(@Body() body: CreateGroupDto, @CurrentUser() user: AuthUser): Promise<GroupResponseDto> {
    const members = body.members.filter((m) => m !== user.username);
    return this.groups.create(body.name, members, user.username, body.description ?? "");
  }

  @Public()
  @Get(":groupId/avatar")
  async avatar(@Param() { groupId }: GroupParamDto): Promise<StreamableFile> {
    const key = await this.groups.findAvatarKey(groupId);
    if (!key) throw new NotFoundException("Group image not found");
    return this.storage.streamFile(key, { inline: true });
  }

  @Get(":groupId")
  async get(@Param() { groupId }: GroupParamDto, @CurrentUser() user: AuthUser): Promise<GroupResponseDto> {
    const group = await this.groups.getById(groupId, user.username);
    if (!group) throw new NotFoundException("Group not found");
    return group;
  }

  @Patch(":groupId")
  async update(
    @Param() { groupId }: GroupParamDto,
    @Body() body: UpdateGroupDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupResponseDto> {
    const group = await this.groups.update(groupId, user.username, body);
    if (!group) throw new ForbiddenException("Only the group creator can update group details");
    return group;
  }

  @Post(":groupId/avatar")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { photo: { type: "string", format: "binary" } } } })
  @ApiOkResponse({ type: ImageResponseDto })
  async uploadAvatar(
    @Param() { groupId }: GroupParamDto,
    @UploadedFile() file: UploadedFileData | undefined,
    @CurrentUser() user: AuthUser,
  ): Promise<ImageResponseDto> {
    if (!file) throw new BadRequestException("No image uploaded");
    await this.groups.saveAvatar(groupId, file);
    const image = this.groups.avatarPublicPath(groupId);
    const group = await this.groups.setImage(groupId, user.username, image);
    if (!group) throw new ForbiddenException("Only the group creator can update the group photo");
    return { image };
  }

  @Delete(":groupId/avatar")
  @ApiOkResponse({ type: OkResponseDto })
  async removeAvatar(@Param() { groupId }: GroupParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    await this.groups.removeAvatar(groupId);
    const group = await this.groups.setImage(groupId, user.username, "");
    if (!group) throw new ForbiddenException("Only the group creator can remove the group photo");
    return { ok: true };
  }
}
