import { CurrentUser, type AuthUser, type UploadedFileData } from "@app/common";
import { StorageService } from "@app/storage";
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import { RoomAccessService } from "../groups/room-access.service.js";
import { MessageResponseDto, RoomParamDto } from "../messages/dto/message.dto.js";
import { MessagesService } from "../messages/messages.service.js";
import { NotificationsService } from "@app/notifications";
import { RealtimeService } from "@app/realtime";
import { UploadFileDto } from "./dto/upload-file.dto.js";
import { FilesService } from "./files.service.js";

class FileParamDto extends RoomParamDto {
  @IsMongoId()
  id!: string;
}

@ApiTags("Files")
@ApiBearerAuth()
@Controller("rooms")
export class FilesController {
  constructor(
    private readonly files: FilesService,
    private readonly messages: MessagesService,
    private readonly roomAccess: RoomAccessService,
    private readonly realtime: RealtimeService,
    private readonly push: NotificationsService,
    private readonly storage: StorageService,
  ) {}

  // Uploads an attachment and posts it as a file message (broadcast like any other message)
  @Post(":room/files")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadFileDto })
  @ApiCreatedResponse({ type: MessageResponseDto })
  async upload(
    @Param() { room }: RoomParamDto,
    @UploadedFile() file: UploadedFileData | undefined,
    @Body() { caption }: UploadFileDto,
    @CurrentUser() user: AuthUser,
  ): Promise<MessageResponseDto> {
    if (!file) throw new BadRequestException("No file uploaded");
    if (!(await this.roomAccess.canAccess(room, user.username))) throw new ForbiddenException("Forbidden");
    const meta = await this.files.save(room, user, file);
    const message = await this.messages.createFileMessage(room, user, meta, caption);
    await this.realtime.emitToRoomParticipants(room, "message", message);
    void this.push.notifyMessage(message);
    return message as MessageResponseDto;
  }

  @Get(":room/files/:id")
  async download(@Param() { room, id }: FileParamDto, @CurrentUser() user: AuthUser): Promise<StreamableFile> {
    if (!(await this.roomAccess.canAccess(room, user.username))) throw new ForbiddenException("Forbidden");
    const file = await this.files.findInRoom(room, id);
    if (!file) throw new NotFoundException("File not found");
    return this.storage.streamFile(file.storedName, { downloadName: file.originalName });
  }
}
