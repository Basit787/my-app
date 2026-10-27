import { appConfig, type AppConfig, type UploadedFileData } from "@app/common";
import { InvoiceRepository, type Invoice } from "@app/db";
import { ObjectStorageService } from "@app/storage";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { ComposeInvoiceDto } from "./dto/compose-invoice.dto.js";
import type { EditPlanDto } from "./dto/edit-plan.dto.js";
import type { InvoiceDetailDto } from "./dto/invoice-detail.dto.js";
import type { InvoiceDto } from "./dto/invoice.dto.js";
import type { UpdateInvoiceDto } from "./dto/update-invoice.dto.js";
import { ExtractorService } from "./extractor.service.js";
import { InvoiceEventsService } from "./invoice-events.service.js";
import { OriginalEditorService } from "./original-editor.service.js";
import { PagePreviewService } from "./page-preview.service.js";
import { applyChanges } from "./utils/apply-changes.js";
import { composedInvoiceFields } from "./utils/composed-invoice-fields.js";
import { CONTENT_TYPES } from "./utils/content-types.js";
import { detectContentType } from "./utils/detect-content-type.js";
import { EDITABLE_CONTENT_TYPES } from "./utils/editable-content-types.js";
import { toInvoiceDetailDto } from "./utils/to-invoice-detail-dto.js";
import { pickInvoiceFields } from "./utils/pick-invoice-fields.js";
import { renderComposedPdf } from "./utils/render-composed-pdf.js";
import { renderInvoicePdf } from "./utils/render-invoice-pdf.js";
import { toInvoiceDto } from "./utils/to-invoice-dto.js";

// The signed-in user's invoices; null means not found for this user. Extraction runs in the background.
@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly invoices: InvoiceRepository,
    private readonly storage: ObjectStorageService,
    private readonly events: InvoiceEventsService,
    private readonly extractor: ExtractorService,
    private readonly previews: PagePreviewService,
    private readonly originals: OriginalEditorService,
  ) {}

  async list(userId: string): Promise<InvoiceDto[]> {
    const invoices = await this.invoices.listForUser(userId);
    return invoices.map(toInvoiceDto);
  }

  async get(id: string, userId: string): Promise<InvoiceDetailDto | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    return invoice ? toInvoiceDetailDto(invoice) : null;
  }

  // The uploaded file itself, shown next to the fields
  async file(id: string, userId: string): Promise<StreamableFile | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return null;
    return this.storage.streamFile(invoice.storageKey, { inline: true });
  }

  // One page of an uploaded PDF as an image, for the viewer
  async pageImage(id: string, userId: string, page: number): Promise<StreamableFile | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return null;
    if (invoice.contentType !== CONTENT_TYPES.pdf) throw new BadRequestException("Only PDF invoices have pages.");
    if (invoice.pageCount !== null && page > invoice.pageCount) throw new NotFoundException("Page not found.");
    return this.previews.page(invoice, page);
  }

  // The invoice as a PDF: the original with the saved corrections drawn in, or a generated one when it can't be edited
  async pdf(id: string, userId: string): Promise<StreamableFile | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return null;
    return this.toPdfFile(invoice, toInvoiceDto(invoice));
  }

  // The same with unsaved changes applied, for downloading what the user sees; nothing is saved
  async pdfWithChanges(id: string, userId: string, changes: UpdateInvoiceDto): Promise<StreamableFile | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return null;
    return this.toPdfFile(invoice, applyChanges(toInvoiceDto(invoice), changes));
  }

  // Where the changes would be drawn on the original, for the live preview
  async editPlan(id: string, userId: string, changes: UpdateInvoiceDto): Promise<EditPlanDto | null> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return null;
    const current = pickInvoiceFields(applyChanges(toInvoiceDto(invoice), changes));
    const { plan, reason } = await this.originals.plan(invoice, current);
    if (!plan) return { supported: false, reason, pages: [], placements: [], unplaced: [] };
    return { supported: true, reason: null, ...plan };
  }

  // PDFs and photos come back as the uploaded file with the edits on it; only XML and TIFF get a generated invoice
  private async toPdfFile(invoice: Invoice, current: InvoiceDto): Promise<StreamableFile> {
    const fromOriginal = EDITABLE_CONTENT_TYPES.includes(invoice.contentType);
    const pdf = fromOriginal
      ? await this.originals.render(invoice, pickInvoiceFields(current))
      : await renderInvoicePdf(current);
    this.logger.log(
      `Invoice PDF ready. id=${invoice.id} from=${fromOriginal ? "original" : "generated"} bytes=${pdf.length}`,
    );
    return new StreamableFile(pdf, { type: "application/pdf", length: pdf.length });
  }

  // A builder invoice as a PDF, without saving it (Download in the builder)
  async composePdf(body: ComposeInvoiceDto): Promise<StreamableFile> {
    const pdf = await this.renderComposed(body);
    return new StreamableFile(pdf, { type: "application/pdf", length: pdf.length });
  }

  // Saves a builder invoice like an upload; its fields are known, so only its word positions are read
  async compose(userId: string, body: ComposeInvoiceDto): Promise<InvoiceDto> {
    const pdf = await this.renderComposed(body);
    const name = (body.data.invoiceNumber?.trim() || "invoice").replace(/[^\w.-]+/g, "_");
    const storageKey = `${userId}/${randomUUID()}.pdf`;
    await this.storage.bucket.put(storageKey, pdf, CONTENT_TYPES.pdf);
    const invoice = await this.invoices.create({
      userId,
      filename: `${name}.pdf`,
      storageKey,
      contentType: CONTENT_TYPES.pdf,
      size: pdf.length,
    });
    this.logger.log(
      `Invoice composed. id=${invoice.id} blocks=${body.blocks.length} lines=${body.data.lineItems.length}`,
    );
    await this.events.publishUpdated(invoice);
    this.extractor.enqueue(invoice.id, composedInvoiceFields(body.data));
    return toInvoiceDto(invoice);
  }

  private async renderComposed(body: ComposeInvoiceDto): Promise<Buffer> {
    try {
      return await renderComposedPdf(body);
    } catch (error) {
      // The standard PDF fonts cover Western European characters only
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("cannot encode"))
        throw new BadRequestException(`The invoice uses a character the PDF fonts can't draw: ${message}`);
      throw error;
    }
  }

  async upload(userId: string, file: UploadedFileData | undefined): Promise<InvoiceDto> {
    if (!file) throw new BadRequestException({ error: "Invalid request", details: { file: ["No file uploaded"] } });
    if (file.size > this.config.maxFileSizeMb * 1024 * 1024) {
      throw new BadRequestException(`Maximum file size is ${this.config.maxFileSizeMb} MB.`);
    }
    const contentType = detectContentType(file.originalname, file.buffer);
    if (!contentType) throw new BadRequestException("Upload a PDF, an XML invoice or an image (PNG, JPG, TIFF).");

    const storageKey = `${userId}/${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    await this.storage.bucket.put(storageKey, file.buffer, contentType);
    const invoice = await this.invoices.create({
      userId,
      filename: file.originalname,
      storageKey,
      contentType,
      size: file.size,
    });
    this.logger.log(`Invoice uploaded. id=${invoice.id} filename=${invoice.filename} type=${contentType}`);
    await this.events.publishUpdated(invoice);
    this.extractor.enqueue(invoice.id);
    return toInvoiceDto(invoice);
  }

  // Saves the user's corrections; not while the file is being read, which would overwrite them
  async update(id: string, userId: string, body: UpdateInvoiceDto): Promise<InvoiceDto | null> {
    const current = await this.invoices.findForUser(id, userId);
    if (!current) return null;
    if (current.status === "PROCESSING") throw new ConflictException("Wait until the invoice has been read.");

    const { lineItems, ...fields } = body;
    const invoice = await this.invoices.updateFields(current.id, {
      ...fields,
      ...(lineItems && { lineItems: lineItems.map((line) => ({ ...line })) }),
    });
    this.logger.log(`Invoice fields updated. id=${invoice.id} fields=${Object.keys(body).join(",")}`);
    await this.events.publishUpdated(invoice);
    return toInvoiceDto(invoice);
  }

  // Reads the file again; replaces the current fields, including corrections
  async reextract(id: string, userId: string): Promise<InvoiceDto | null> {
    const current = await this.invoices.findForUser(id, userId);
    if (!current) return null;
    if (current.status === "PROCESSING") throw new ConflictException("The invoice is being read right now.");

    const invoice = await this.invoices.updateStatus(current.id, "UPLOADED");
    await this.events.publishUpdated(invoice);
    this.extractor.enqueue(invoice.id);
    return toInvoiceDto(invoice);
  }

  // Archived invoices keep their file and data and can be restored
  async setArchived(id: string, userId: string, archived: boolean): Promise<InvoiceDto | null> {
    const current = await this.invoices.findForUser(id, userId);
    if (!current) return null;

    const invoice = await this.invoices.setArchivedAt(current.id, archived ? new Date() : null);
    this.logger.log(`Invoice ${archived ? "archived" : "restored"}. id=${invoice.id}`);
    await this.events.publishUpdated(invoice);
    return toInvoiceDto(invoice);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const invoice = await this.invoices.findForUser(id, userId);
    if (!invoice) return false;
    await this.storage.bucket.delete(invoice.storageKey);
    // Page previews and the word layout are stored as `<storageKey>.<something>`
    await this.storage.bucket.deleteByPrefix(`${invoice.storageKey}.`);
    await this.invoices.delete(invoice.id);
    this.logger.log(`Invoice deleted. id=${invoice.id}`);
    await this.events.publishDeleted(userId, invoice.id);
    return true;
  }
}
