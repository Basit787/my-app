import { InvoiceRepository } from "@app/db";
import { InvoiceModelService } from "@app/llm";
import { OcrService } from "@app/ocr";
import { ObjectStorageService } from "@app/storage";
import { Injectable, Logger } from "@nestjs/common";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { InvoiceEventsService } from "./invoice-events.service.js";
import type { FileReading } from "./types/file-reading.js";
import type { InvoiceFields } from "./types/invoice-fields.js";
import { CONTENT_TYPES } from "./utils/content-types.js";
import { layoutKey } from "./utils/layout-key.js";
import { parseInvoiceXml } from "./utils/parse-invoice-xml.js";
import { readBuffer } from "./utils/read-buffer.js";
import { toInvoiceFields } from "./utils/to-invoice-fields.js";

// Longest error message kept on the invoice
const MAX_ERROR_LENGTH = 1000;

// Background extraction, one invoice at a time (OCR and the model each use the whole CPU)
@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly invoices: InvoiceRepository,
    private readonly storage: ObjectStorageService,
    private readonly ocr: OcrService,
    private readonly model: InvoiceModelService,
    private readonly events: InvoiceEventsService,
  ) {}

  // Runs after the invoices queued before it; `knownFields` (builder invoices) skip the model
  enqueue(invoiceId: string, knownFields?: InvoiceFields): void {
    this.queue = this.queue.then(() => this.extract(invoiceId, knownFields));
  }

  // Invoices left unfinished by a restart are read again
  async resumePending(): Promise<void> {
    const invoiceIds = await this.invoices.pendingIds();
    this.logger.log(`Resuming ${invoiceIds.length} unfinished invoices.`);
    for (const invoiceId of invoiceIds) this.enqueue(invoiceId);
  }

  // Never throws: a failure marks the invoice FAILED with the reason
  private async extract(invoiceId: string, knownFields?: InvoiceFields): Promise<void> {
    const workDir = await mkdtemp(path.join(tmpdir(), "invoice-"));
    try {
      this.logger.log(`Step 1/4: marking invoice as processing. id=${invoiceId}`);
      let invoice = await this.invoices.updateStatus(invoiceId, "PROCESSING");
      await this.events.publishUpdated(invoice);

      this.logger.log(`Step 2/4: downloading file. id=${invoiceId} key=${invoice.storageKey}`);
      const object = await this.storage.bucket.getObject(invoice.storageKey);
      if (!object) throw new Error(`Object ${invoice.storageKey} is missing from the bucket`);
      const filePath = path.join(workDir, `upload${path.extname(invoice.storageKey)}`);
      await writeFile(filePath, await readBuffer(object.stream));
      if (invoice.contentType === CONTENT_TYPES.pdf) {
        invoice = await this.invoices.updatePageCount(invoiceId, await this.ocr.countPages(filePath));
        await this.events.publishUpdated(invoice);
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
      await this.events.publishUpdated(invoice);
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
      await this.events.publishUpdated(invoice);
    } catch {
      // Usually the invoice was deleted while it was being read
      this.logger.warn(`Could not mark invoice as failed. id=${invoiceId}`);
    }
  }
}
