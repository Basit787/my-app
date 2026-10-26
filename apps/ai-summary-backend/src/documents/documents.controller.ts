import { CurrentUser, type AuthUser, type UploadedFileData } from "@app/common";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DocumentsService } from "./documents.service.js";
import { DocumentParamDto } from "./dto/document-param.dto.js";
import { DocumentDto } from "./dto/document.dto.js";
import { MessageResponseDto } from "./dto/message-response.dto.js";
import { UploadDocumentDto } from "./dto/upload-document.dto.js";

const notFound = () => new NotFoundException("Document not found.");

@ApiTags("Documents")
@ApiBearerAuth()
@Controller("documents")
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @ApiOkResponse({ type: [DocumentDto] })
  list(@CurrentUser() user: AuthUser): Promise<DocumentDto[]> {
    return this.documents.list(user.id);
  }

  // The summary is generated in the background; status changes arrive on GET /events
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadDocumentDto })
  @ApiCreatedResponse({ type: DocumentDto })
  upload(@UploadedFile() file: UploadedFileData | undefined, @CurrentUser() user: AuthUser): Promise<DocumentDto> {
    return this.documents.upload(user.id, file);
  }

  @Get(":documentId")
  @ApiOkResponse({ type: DocumentDto })
  async get(@Param() { documentId }: DocumentParamDto, @CurrentUser() user: AuthUser): Promise<DocumentDto> {
    const document = await this.documents.get(documentId, user.id);
    if (!document) throw notFound();
    return document;
  }

  @Post(":documentId/summarize")
  @HttpCode(202)
  @ApiAcceptedResponse({ type: DocumentDto })
  async retrySummary(@Param() { documentId }: DocumentParamDto, @CurrentUser() user: AuthUser): Promise<DocumentDto> {
    const document = await this.documents.retrySummary(documentId, user.id);
    if (!document) throw notFound();
    return document;
  }

  @Delete(":documentId")
  @ApiOkResponse({ type: MessageResponseDto })
  async remove(@Param() { documentId }: DocumentParamDto, @CurrentUser() user: AuthUser): Promise<MessageResponseDto> {
    if (!(await this.documents.remove(documentId, user.id))) throw notFound();
    return { message: "Document deleted successfully." };
  }
}
