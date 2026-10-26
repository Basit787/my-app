import { CurrentUser, OkResponseDto, type AuthUser } from "@app/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  StreamableFile,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiProduces, ApiTags } from "@nestjs/swagger";
import { ConversationsService } from "./conversations.service.js";
import { ConversationDetailDto } from "./dto/conversation-detail.dto.js";
import { ConversationListDto } from "./dto/conversation-list.dto.js";
import { ConversationParamDto } from "./dto/conversation-param.dto.js";
import { ConversationDto } from "./dto/conversation.dto.js";
import { RenameConversationDto } from "./dto/rename-conversation.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";

const notFound = () => new NotFoundException("Conversation not found");

@ApiTags("Conversations")
@ApiBearerAuth()
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  @ApiOkResponse({ type: ConversationListDto })
  async list(@CurrentUser() user: AuthUser): Promise<ConversationListDto> {
    return { conversations: await this.conversations.list(user.id) };
  }

  @Post()
  @ApiCreatedResponse({ type: ConversationDto })
  create(@CurrentUser() user: AuthUser): Promise<ConversationDto> {
    return this.conversations.create(user.id);
  }

  @Get(":id")
  @ApiOkResponse({ type: ConversationDetailDto })
  async get(@Param() { id }: ConversationParamDto, @CurrentUser() user: AuthUser): Promise<ConversationDetailDto> {
    const detail = await this.conversations.getDetail(id, user.id);
    if (!detail) throw notFound();
    return detail;
  }

  @Patch(":id")
  @ApiOkResponse({ type: ConversationDto })
  async rename(
    @Param() { id }: ConversationParamDto,
    @Body() body: RenameConversationDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationDto> {
    const conversation = await this.conversations.rename(id, user.id, body.title);
    if (!conversation) throw notFound();
    return conversation;
  }

  @Delete(":id")
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Param() { id }: ConversationParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.conversations.remove(id, user.id))) throw notFound();
    return { ok: true };
  }

  // Streams the reply as NDJSON lines: {type:"delta",text}..., then {type:"done",message,conversation} or {type:"error"}
  @Post(":id/messages")
  @HttpCode(200)
  @ApiProduces("application/x-ndjson")
  @ApiOkResponse({ description: "NDJSON stream of ChatStreamEvent lines" })
  async sendMessage(
    @Param() { id }: ConversationParamDto,
    @Body() body: SendMessageDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const stream = await this.conversations.startReply(id, user.id, body.content);
    if (!stream) throw notFound();
    return new StreamableFile(stream, { type: "application/x-ndjson" });
  }
}
