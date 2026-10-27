import type { Invoice } from "@app/db";
import { OcrService } from "@app/ocr";
import { ObjectStorageService } from "@app/storage";
import { Injectable, Logger, StreamableFile } from "@nestjs/common";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readBuffer } from "./utils/read-buffer.js";

// Sharp on screens without heavy files: an A4 page is about 1240 × 1750 pixels
const PREVIEW_DPI = 150;

// PDF pages as JPEG images for the viewer, rendered once and then served from MinIO
@Injectable()
export class PagePreviewService {
  private readonly logger = new Logger(PagePreviewService.name);

  constructor(
    private readonly storage: ObjectStorageService,
    private readonly ocr: OcrService,
  ) {}

  // Cached previews sit next to the file, so deleting by this prefix removes them all
  static prefixFor(invoice: Invoice): string {
    return `${invoice.storageKey}.pages/`;
  }

  async page(invoice: Invoice, page: number): Promise<StreamableFile> {
    const cacheKey = `${PagePreviewService.prefixFor(invoice)}${page}.jpg`;
    if (await this.storage.bucket.exists(cacheKey)) return this.storage.streamFile(cacheKey, { inline: true });

    const image = await this.render(invoice, page);
    await this.storage.bucket.put(cacheKey, image, "image/jpeg");
    return new StreamableFile(image, { type: "image/jpeg", length: image.length });
  }

  private async render(invoice: Invoice, page: number): Promise<Buffer> {
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
}
