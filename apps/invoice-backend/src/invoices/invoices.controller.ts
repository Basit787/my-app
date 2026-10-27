import { CurrentUser, type AuthUser, type UploadedFileData } from "@app/common";
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
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import { ComposeInvoiceDto } from "./dto/compose-invoice.dto.js";
import { EditPlanDto } from "./dto/edit-plan.dto.js";
import { InvoiceDetailDto } from "./dto/invoice-detail.dto.js";
import { InvoicePageParamDto } from "./dto/invoice-page-param.dto.js";
import { InvoiceParamDto } from "./dto/invoice-param.dto.js";
import { InvoiceDto } from "./dto/invoice.dto.js";
import { MessageResponseDto } from "./dto/message-response.dto.js";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto.js";
import { UploadInvoiceDto } from "./dto/upload-invoice.dto.js";
import { InvoicesService } from "./invoices.service.js";

const notFound = () => new NotFoundException("Invoice not found.");

@ApiTags("Invoices")
@ApiBearerAuth()
@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOkResponse({ type: [InvoiceDto] })
  list(@CurrentUser() user: AuthUser): Promise<InvoiceDto[]> {
    return this.invoices.list(user.id);
  }

  // The fields are read in the background; status changes arrive on GET /events
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadInvoiceDto })
  @ApiCreatedResponse({ type: InvoiceDto })
  upload(@UploadedFile() file: UploadedFileData | undefined, @CurrentUser() user: AuthUser): Promise<InvoiceDto> {
    return this.invoices.upload(user.id, file);
  }

  // Invoices designed in the builder; static routes before ":invoiceId"
  @Post("compose")
  @ApiCreatedResponse({ type: InvoiceDto })
  compose(@Body() body: ComposeInvoiceDto, @CurrentUser() user: AuthUser): Promise<InvoiceDto> {
    return this.invoices.compose(user.id, body);
  }

  @Post("compose/pdf")
  @HttpCode(200)
  @ApiProduces("application/pdf")
  @ApiOkResponse({ description: "The builder invoice as a PDF; nothing is saved" })
  composePdf(@Body() body: ComposeInvoiceDto): Promise<StreamableFile> {
    return this.invoices.composePdf(body);
  }

  @Get(":invoiceId")
  @ApiOkResponse({ type: InvoiceDetailDto })
  async get(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<InvoiceDetailDto> {
    const invoice = await this.invoices.get(invoiceId, user.id);
    if (!invoice) throw notFound();
    return invoice;
  }

  @Get(":invoiceId/file")
  @ApiProduces("application/pdf", "application/xml", "image/png", "image/jpeg", "image/tiff")
  @ApiOkResponse({ description: "The uploaded file" })
  async file(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const file = await this.invoices.file(invoiceId, user.id);
    if (!file) throw notFound();
    return file;
  }

  @Get(":invoiceId/pages/:page")
  @ApiProduces("image/jpeg")
  @ApiOkResponse({ description: "One page of the uploaded PDF as a JPEG image" })
  async page(
    @Param() { invoiceId, page }: InvoicePageParamDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const image = await this.invoices.pageImage(invoiceId, user.id, page);
    if (!image) throw notFound();
    return image;
  }

  @Get(":invoiceId/pdf")
  @ApiProduces("application/pdf")
  @ApiOkResponse({
    description: "The original with the saved corrections drawn in (generated when it can't be edited)",
  })
  async pdf(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const pdf = await this.invoices.pdf(invoiceId, user.id);
    if (!pdf) throw notFound();
    return pdf;
  }

  @Post(":invoiceId/pdf")
  @HttpCode(200)
  @ApiProduces("application/pdf")
  @ApiOkResponse({ description: "The original with the body's unsaved changes drawn in; nothing is saved" })
  async pdfWithChanges(
    @Param() { invoiceId }: InvoiceParamDto,
    @Body() body: UpdateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StreamableFile> {
    const pdf = await this.invoices.pdfWithChanges(invoiceId, user.id, body);
    if (!pdf) throw notFound();
    return pdf;
  }

  // Live preview: where the body's values would be drawn on the original; nothing is saved
  @Post(":invoiceId/edit-plan")
  @HttpCode(200)
  @ApiOkResponse({ type: EditPlanDto })
  async editPlan(
    @Param() { invoiceId }: InvoiceParamDto,
    @Body() body: UpdateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<EditPlanDto> {
    const plan = await this.invoices.editPlan(invoiceId, user.id, body);
    if (!plan) throw notFound();
    return plan;
  }

  @Patch(":invoiceId")
  @ApiOkResponse({ type: InvoiceDto })
  async update(
    @Param() { invoiceId }: InvoiceParamDto,
    @Body() body: UpdateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<InvoiceDto> {
    const invoice = await this.invoices.update(invoiceId, user.id, body);
    if (!invoice) throw notFound();
    return invoice;
  }

  @Post(":invoiceId/extract")
  @HttpCode(202)
  @ApiAcceptedResponse({ type: InvoiceDto })
  async reextract(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<InvoiceDto> {
    const invoice = await this.invoices.reextract(invoiceId, user.id);
    if (!invoice) throw notFound();
    return invoice;
  }

  @Post(":invoiceId/archive")
  @HttpCode(200)
  @ApiOkResponse({ type: InvoiceDto })
  async archive(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<InvoiceDto> {
    const invoice = await this.invoices.setArchived(invoiceId, user.id, true);
    if (!invoice) throw notFound();
    return invoice;
  }

  @Post(":invoiceId/restore")
  @HttpCode(200)
  @ApiOkResponse({ type: InvoiceDto })
  async restore(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<InvoiceDto> {
    const invoice = await this.invoices.setArchived(invoiceId, user.id, false);
    if (!invoice) throw notFound();
    return invoice;
  }

  @Delete(":invoiceId")
  @ApiOkResponse({ type: MessageResponseDto })
  async remove(@Param() { invoiceId }: InvoiceParamDto, @CurrentUser() user: AuthUser): Promise<MessageResponseDto> {
    if (!(await this.invoices.remove(invoiceId, user.id))) throw notFound();
    return { message: "Invoice deleted successfully." };
  }
}
