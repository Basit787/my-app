import { appConfig, type AppConfig, type UploadedFileData } from "@app/common";
import { InvoiceRepository, type Invoice } from "@app/db";
import { EventBrokerService } from "@app/events";
import { InvoiceModelService } from "@app/llm";
import { OcrService, type PageLayout } from "@app/ocr";
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
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import type { ComposeInvoiceDto } from "./dto/compose-invoice.dto.js";
import type { EditPlanDto } from "./dto/edit-plan.dto.js";
import type { InvoiceDetailDto } from "./dto/invoice-detail.dto.js";
import type { InvoiceDto } from "./dto/invoice.dto.js";
import type { UpdateInvoiceDto } from "./dto/update-invoice.dto.js";
import type { EditPlan } from "./types/edit-plan.js";
import type { FileReading } from "./types/file-reading.js";
import type { InvoiceEvent } from "./types/invoice-event.js";
import type { InvoiceFields } from "./types/invoice-fields.js";
import { applyChanges } from "./utils/apply-changes.js";
import { applyEditPlan } from "./utils/apply-edit-plan.js";
import { composedInvoiceFields } from "./utils/composed-invoice-fields.js";
import { CONTENT_TYPES } from "./utils/content-types.js";
import { detectContentType } from "./utils/detect-content-type.js";
import { EDITABLE_CONTENT_TYPES } from "./utils/editable-content-types.js";
import { layoutKey } from "./utils/layout-key.js";
import { parseInvoiceXml } from "./utils/parse-invoice-xml.js";
import { pickInvoiceFields } from "./utils/pick-invoice-fields.js";
import { planEdits } from "./utils/plan-edits.js";
import { readBuffer } from "./utils/read-buffer.js";
import { renderComposedPdf } from "./utils/render-composed-pdf.js";
import { renderInvoicePdf } from "./utils/render-invoice-pdf.js";
import { standardFontName } from "./utils/standard-font-name.js";
import { toInvoiceDetailDto } from "./utils/to-invoice-detail-dto.js";
import { toInvoiceDto } from "./utils/to-invoice-dto.js";
import { toInvoiceFields } from "./utils/to-invoice-fields.js";

// Longest error message kept on the invoice
const MAX_ERROR_LENGTH = 1000;
// Sharp on screens without heavy files: an A4 page is about 1240 × 1750 pixels
const PREVIEW_DPI = 150;

type PlanResult = { plan: EditPlan; reason: null } | { plan: null; reason: string };

// The signed-in user's invoices; null means not found for this user. Extraction runs in the background, one invoice
// at a time; every change is pushed to the owner's open event streams.
@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  // Extraction queue: OCR and the model each use the whole CPU
  private queue: Promise<void> = Promise.resolve();
  // Every standard face, only for measuring text; the same metrics as the fonts embedded in each edited PDF
  private readonly fonts: Promise<Map<StandardFonts, PDFFont>> = PDFDocument.create().then(async (doc) => {
    const names = Object.values(StandardFonts).filter((name) => !/Symbol|ZapfDingbats/.test(name));
    return new Map(await Promise.all(names.map(async (name) => [name, await doc.embedFont(name)] as const)));
  });

  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    private readonly invoices: InvoiceRepository,
    private readonly storage: ObjectStorageService,
    private readonly ocr: OcrService,
    private readonly model: InvoiceModelService,
    private readonly broker: EventBrokerService,
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
    return this.pagePreview(invoice, page);
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
    const { plan, reason } = await this.planOriginalEdits(invoice, current);
    if (!plan) return { supported: false, reason, pages: [], placements: [], unplaced: [] };
    return { supported: true, reason: null, ...plan };
  }

  // PDFs and photos come back as the uploaded file with the edits on it; only XML and TIFF get a generated invoice
  private async toPdfFile(invoice: Invoice, current: InvoiceDto): Promise<StreamableFile> {
    const fromOriginal = EDITABLE_CONTENT_TYPES.includes(invoice.contentType);
    const pdf = fromOriginal
      ? await this.renderEditedOriginal(invoice, pickInvoiceFields(current))
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
    await this.publishUpdated(invoice);
    this.enqueue(invoice.id, composedInvoiceFields(body.data));
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
    await this.publishUpdated(invoice);
    this.enqueue(invoice.id);
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
    await this.publishUpdated(invoice);
    return toInvoiceDto(invoice);
  }

  // Reads the file again; replaces the current fields, including corrections
  async reextract(id: string, userId: string): Promise<InvoiceDto | null> {
    const current = await this.invoices.findForUser(id, userId);
    if (!current) return null;
    if (current.status === "PROCESSING") throw new ConflictException("The invoice is being read right now.");

    const invoice = await this.invoices.updateStatus(current.id, "UPLOADED");
    await this.publishUpdated(invoice);
    this.enqueue(invoice.id);
    return toInvoiceDto(invoice);
  }

  // Archived invoices keep their file and data and can be restored
  async setArchived(id: string, userId: string, archived: boolean): Promise<InvoiceDto | null> {
    const current = await this.invoices.findForUser(id, userId);
    if (!current) return null;

    const invoice = await this.invoices.setArchivedAt(current.id, archived ? new Date() : null);
    this.logger.log(`Invoice ${archived ? "archived" : "restored"}. id=${invoice.id}`);
    await this.publishUpdated(invoice);
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
    await this.publishDeleted(userId, invoice.id);
    return true;
  }

  // Invoices left unfinished by a restart are read again
  async resumePending(): Promise<void> {
    const invoiceIds = await this.invoices.pendingIds();
    this.logger.log(`Resuming ${invoiceIds.length} unfinished invoices.`);
    for (const invoiceId of invoiceIds) this.enqueue(invoiceId);
  }

  // Runs after the invoices queued before it; `knownFields` (builder invoices) skip the model
  private enqueue(invoiceId: string, knownFields?: InvoiceFields): void {
    this.queue = this.queue.then(() => this.extract(invoiceId, knownFields));
  }

  // Never throws: a failure marks the invoice FAILED with the reason
  private async extract(invoiceId: string, knownFields?: InvoiceFields): Promise<void> {
    const workDir = await mkdtemp(path.join(tmpdir(), "invoice-"));
    try {
      this.logger.log(`Step 1/4: marking invoice as processing. id=${invoiceId}`);
      let invoice = await this.invoices.updateStatus(invoiceId, "PROCESSING");
      await this.publishUpdated(invoice);

      this.logger.log(`Step 2/4: downloading file. id=${invoiceId} key=${invoice.storageKey}`);
      const object = await this.storage.bucket.getObject(invoice.storageKey);
      if (!object) throw new Error(`Object ${invoice.storageKey} is missing from the bucket`);
      const filePath = path.join(workDir, `upload${path.extname(invoice.storageKey)}`);
      await writeFile(filePath, await readBuffer(object.stream));
      if (invoice.contentType === CONTENT_TYPES.pdf) {
        invoice = await this.invoices.updatePageCount(invoiceId, await this.ocr.countPages(filePath));
        await this.publishUpdated(invoice);
      }

      this.logger.log(`Step 3/4: reading the file. id=${invoiceId} type=${invoice.contentType}`);
      const reading = await this.readFile(filePath, invoice.contentType, workDir);
      if (!reading.text.trim()) throw new Error("No text found in the file, even with OCR");

      this.logger.log(
        `Step 4/4: reading the fields. id=${invoiceId} source=${reading.source} exact=${!!reading.fields} chars=${reading.text.length}`,
      );
      const fields = knownFields ?? reading.fields ?? toInvoiceFields(await this.model.extractFields(reading.text));

      // Word positions let edits be written onto the original file later
      if (reading.layout) {
        const layoutJson = Buffer.from(JSON.stringify(reading.layout));
        await this.storage.bucket.put(layoutKey(invoice.storageKey), layoutJson, "application/json");
      }

      invoice = await this.invoices.saveExtraction(invoiceId, {
        ...fields,
        extractedFields: fields,
        source: reading.source,
        pageCount: reading.pageCount,
        extractedText: reading.text,
      });
      await this.publishUpdated(invoice);
      this.logger.log(
        `Invoice extracted. id=${invoiceId} number=${fields.invoiceNumber} total=${fields.totalAmount} lines=${fields.lineItems.length}`,
      );
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error(`Invoice extraction failed. id=${invoiceId}: ${message}`);
      await this.markFailed(invoiceId, error instanceof Error ? error.message : String(error));
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  // XML is read exactly; PDFs prefer an embedded XML invoice, then each page's text layer, then OCR; images use OCR
  private async readFile(filePath: string, contentType: string, workDir: string): Promise<FileReading> {
    if (contentType === CONTENT_TYPES.xml) {
      const xml = await readFile(filePath, "utf8");
      return { source: "XML", pageCount: null, text: xml, fields: parseInvoiceXml(xml), layout: null };
    }

    if (contentType === CONTENT_TYPES.pdf) {
      const embeddedXml = await this.ocr.readEmbeddedXml(filePath, workDir);
      const xmlFields = embeddedXml ? parseInvoiceXml(embeddedXml) : null;
      const pdf = await this.ocr.readPdf(filePath, workDir);
      const source = xmlFields ? "XML" : pdf.ocrPages > 0 ? "OCR" : "TEXT";
      return { source, pageCount: pdf.pageCount, text: pdf.text, fields: xmlFields, layout: pdf.pages };
    }

    const image = await this.ocr.readUploadedImage(filePath, contentType);
    return { source: "OCR", pageCount: 1, text: image.text, fields: null, layout: [image.layout] };
  }

  private async markFailed(invoiceId: string, reason: string) {
    try {
      const invoice = await this.invoices.markFailed(invoiceId, reason.slice(0, MAX_ERROR_LENGTH));
      await this.publishUpdated(invoice);
    } catch {
      // Usually the invoice was deleted while it was being read
      this.logger.warn(`Could not mark invoice as failed. id=${invoiceId}`);
    }
  }

  // A PDF page as a JPEG for the viewer, rendered once and then served from S3 next to the file
  // (`<storageKey>.pages/`, so deleting by the file's prefix removes them all)
  private async pagePreview(invoice: Invoice, page: number): Promise<StreamableFile> {
    const cacheKey = `${invoice.storageKey}.pages/${page}.jpg`;
    if (await this.storage.bucket.exists(cacheKey)) return this.storage.streamFile(cacheKey, { inline: true });

    const image = await this.renderPagePreview(invoice, page);
    await this.storage.bucket.put(cacheKey, image, "image/jpeg");
    return new StreamableFile(image, { type: "image/jpeg", length: image.length });
  }

  private async renderPagePreview(invoice: Invoice, page: number): Promise<Buffer> {
    const workDir = await mkdtemp(path.join(tmpdir(), "invoice-preview-"));
    try {
      const object = await this.storage.bucket.getObject(invoice.storageKey);
      if (!object) throw new Error(`Object ${invoice.storageKey} is missing from the bucket`);
      const pdfPath = path.join(workDir, "upload.pdf");
      await writeFile(pdfPath, await readBuffer(object.stream));

      const started = Date.now();
      const imagePath = await this.ocr.renderPage(pdfPath, page, path.join(workDir, "page"), {
        dpi: PREVIEW_DPI,
        format: "jpeg",
      });
      const image = await readFile(imagePath);
      this.logger.log(`Page preview rendered. id=${invoice.id} page=${page} ms=${Date.now() - started}`);
      return image;
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  // Where the user's corrections go on the uploaded file itself (over the old values), or why it can't be edited
  private async planOriginalEdits(invoice: Invoice, current: InvoiceFields): Promise<PlanResult> {
    if (!EDITABLE_CONTENT_TYPES.includes(invoice.contentType)) {
      const reason =
        invoice.contentType === "image/tiff" ? "TIFF images can't be edited" : "XML invoices have no printed original";
      return { plan: null, reason };
    }
    const layout = invoice.extractedFields ? await this.loadLayout(invoice) : null;
    if (!layout) return { plan: null, reason: "Read the invoice again to edit the original" };

    const fonts = await this.fonts;
    const extracted = invoice.extractedFields as unknown as InvoiceFields;
    const plan = planEdits(layout, extracted, current, (text, size, style) => {
      const font = fonts.get(standardFontName(style));
      if (!font) throw new Error(`Font ${standardFontName(style)} is not loaded`);
      return font.widthOfTextAtSize(text, size);
    });
    return { plan, reason: null };
  }

  // The original as a PDF with the corrections drawn in. Only for EDITABLE_CONTENT_TYPES; never swapped for a generated invoice.
  private async renderEditedOriginal(invoice: Invoice, current: InvoiceFields): Promise<Buffer> {
    const { plan, reason } = await this.planOriginalEdits(invoice, current);
    if (!plan) {
      this.logger.warn(`Original can't be edited yet. id=${invoice.id}: ${reason}`);
      throw new ConflictException(`${reason}: it was read before edits could be placed on the original file.`);
    }
    const object = await this.storage.bucket.getObject(invoice.storageKey);
    if (!object) throw new Error(`Object ${invoice.storageKey} is missing from the bucket`);

    const { pdf, skipped } = await applyEditPlan(await readBuffer(object.stream), invoice.contentType, plan);
    const notPlaced = [...plan.unplaced, ...skipped];
    this.logger.log(
      `Original edited. id=${invoice.id} placed=${plan.placements.length - skipped.length} not_placed=${notPlaced.join("; ") || "none"}`,
    );
    return pdf;
  }

  private async loadLayout(invoice: Invoice): Promise<PageLayout[] | null> {
    const object = await this.storage.bucket.getObject(layoutKey(invoice.storageKey));
    if (!object) return null;
    return JSON.parse((await readBuffer(object.stream)).toString("utf8")) as PageLayout[];
  }

  // Same JSON as the REST replies, so the client can drop it straight into its list
  private async publishUpdated(invoice: Invoice): Promise<void> {
    const event: InvoiceEvent = { type: "invoice.updated", invoice: toInvoiceDto(invoice) };
    await this.broker.publish(invoice.userId, event);
  }

  private async publishDeleted(userId: string, id: string): Promise<void> {
    const event: InvoiceEvent = { type: "invoice.deleted", id };
    await this.broker.publish(userId, event);
  }
}
