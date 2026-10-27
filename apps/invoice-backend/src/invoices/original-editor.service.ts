import type { Invoice } from "@app/db";
import type { PageLayout } from "@app/ocr";
import { ObjectStorageService } from "@app/storage";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import type { EditPlan } from "./types/edit-plan.js";
import type { InvoiceFields } from "./types/invoice-fields.js";
import { applyEditPlan } from "./utils/apply-edit-plan.js";
import { EDITABLE_CONTENT_TYPES } from "./utils/editable-content-types.js";
import { layoutKey } from "./utils/layout-key.js";
import { planEdits } from "./utils/plan-edits.js";
import { readBuffer } from "./utils/read-buffer.js";
import { standardFontName } from "./utils/standard-font-name.js";

type PlanResult = { plan: EditPlan; reason: null } | { plan: null; reason: string };

// Writes the user's corrections onto the uploaded file itself, where the old values are printed
@Injectable()
export class OriginalEditorService {
  private readonly logger = new Logger(OriginalEditorService.name);
  // Every standard face, only for measuring text; the same metrics as the fonts embedded in each edited PDF
  private readonly fonts: Promise<Map<StandardFonts, PDFFont>> = PDFDocument.create().then(async (doc) => {
    const names = Object.values(StandardFonts).filter((name) => !/Symbol|ZapfDingbats/.test(name));
    return new Map(await Promise.all(names.map(async (name) => [name, await doc.embedFont(name)] as const)));
  });

  constructor(private readonly storage: ObjectStorageService) {}

  // The placements for `current`, or why the original can't be edited
  async plan(invoice: Invoice, current: InvoiceFields): Promise<PlanResult> {
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
  async render(invoice: Invoice, current: InvoiceFields): Promise<Buffer> {
    const { plan, reason } = await this.plan(invoice, current);
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
}
