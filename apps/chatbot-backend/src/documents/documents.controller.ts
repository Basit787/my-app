import { CurrentUser, OkResponseDto, type AuthUser } from "@app/common";
import { Controller, Delete, Get, NotFoundException, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { UploadedFileData } from "backend-common";
import { ConversationParamDto } from "../conversations/dto/conversation-param.dto.js";
import { DocumentsService } from "./documents.service.js";
import { DocumentListDto } from "./dto/document-list.dto.js";
import { DocumentParamDto } from "./dto/document-param.dto.js";
import { DocumentDto } from "./dto/document.dto.js";
import { UploadDocumentDto } from "./dto/upload-document.dto.js";

const notFound = (what: string) => new NotFoundException(`${what} not found`);

@ApiTags("Documents")
@ApiBearerAuth()
@Controller("conversations/:id/documents")
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiOkResponse({ type: DocumentListDto })
  async list(@Param() { id }: ConversationParamDto, @CurrentUser() user: AuthUser): Promise<DocumentListDto> {
    const documents = await this.documents.list(id, user.id);
    if (!documents) throw notFound("Conversation");
    return { documents };
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadDocumentDto })
  @ApiCreatedResponse({ type: DocumentDto })
  async upload(
    @Param() { id }: ConversationParamDto,
    @UploadedFile() file: UploadedFileData | undefined,
    @CurrentUser() user: AuthUser,
  ): Promise<DocumentDto> {
    const document = await this.documents.upload(id, user.id, file);
    if (!document) throw notFound("Conversation");
    return document;
  }

  @Delete(":documentId")
  @ApiOkResponse({ type: OkResponseDto })
  async remove(@Param() { id, documentId }: DocumentParamDto, @CurrentUser() user: AuthUser): Promise<OkResponseDto> {
    if (!(await this.documents.remove(id, documentId, user.id))) throw notFound("Document");
    return { ok: true };
  }
}
