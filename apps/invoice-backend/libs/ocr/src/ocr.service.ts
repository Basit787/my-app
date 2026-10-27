import { appConfig, type AppConfig } from "@app/common";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageText } from "./types/image-text.js";
import type { PageLayout } from "./types/page-layout.js";
import type { PdfText } from "./types/pdf-text.js";
import type { Raster } from "./types/raster.js";
import type { TextRun } from "./types/text-run.js";
import { applyWordStyles } from "./utils/apply-word-styles.js";
import { countWordChars } from "./utils/count-word-chars.js";
import { decodeImage } from "./utils/decode-image.js";
import { parseBboxHtml } from "./utils/parse-bbox-html.js";
import { parsePdftohtml } from "./utils/parse-pdftohtml.js";
import { parsePpm } from "./utils/parse-ppm.js";
import { parseTesseractTsv } from "./utils/parse-tesseract-tsv.js";
import { runCommand } from "./utils/run-command.js";

// A page with fewer letters and digits than this in its text layer is treated as a scan
const MIN_PAGE_CHARS = 40;
// Resolution scanned pages are rendered at for Tesseract; 300 DPI is what it is trained for
const OCR_DPI = 300;
// PDF points per pixel of a page rendered at OCR_DPI
const POINTS_PER_OCR_PIXEL = 72 / OCR_DPI;
// Text-layer pages are rendered at 1 pixel per point, enough to sample the colour behind each word
const STYLE_DPI = 72;
// pdftohtml rounds sizes and positions to whole units; zooming in keeps fractions of a point
const PDFTOHTML_ZOOM = 4;

// Reads invoice files with Poppler (text layer, attachments, rendering) and Tesseract (OCR)
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(@Inject(appConfig.KEY) private readonly config: AppConfig) {}

  // Factur-X, ZUGFeRD and XRechnung PDFs carry the invoice as an XML attachment; null when there is none
  async readEmbeddedXml(pdfPath: string, workDir: string): Promise<string | null> {
    const list = await runCommand("pdfdetach", ["-list", pdfPath]);
    const attachment = list
      .split("\n")
      .map((line) => /^(\d+):\s+(.+)$/.exec(line.trim()))
      .find((match) => match?.[2].toLowerCase().endsWith(".xml"));
    if (!attachment) return null;

    const xmlPath = path.join(workDir, "embedded.xml");
    await runCommand("pdfdetach", ["-save", attachment[1], "-o", xmlPath, pdfPath]);
    this.logger.log(`Embedded XML found. file=${attachment[2]}`);
    return readFile(xmlPath, "utf8");
  }

  // Each page from its text layer when it has one, otherwise rendered and read with Tesseract
  async readPdf(pdfPath: string, workDir: string): Promise<PdfText> {
    const pageCount = await this.countPages(pdfPath);
    const pagesToRead = Math.min(pageCount, this.config.ocr.maxPages);
    if (pagesToRead < pageCount) this.logger.warn(`Reading only ${pagesToRead} of ${pageCount} pages.`);

    const pages: string[] = [];
    const layouts: PageLayout[] = [];
    let ocrPages = 0;
    for (let page = 1; page <= pagesToRead; page++) {
      const pageArgs = ["-f", String(page), "-l", String(page)];
      const textLayer = await runCommand("pdftotext", ["-layout", ...pageArgs, pdfPath, "-"]);
      if (countWordChars(textLayer) >= MIN_PAGE_CHARS) {
        pages.push(textLayer.trim());
        const words = parseBboxHtml(await runCommand("pdftotext", ["-bbox", ...pageArgs, pdfPath, "-"]));
        const runs = await this.readTextRuns(pdfPath, page, words.width);
        const raster = await this.renderRaster(pdfPath, page, path.join(workDir, `style-${page}`), STYLE_DPI);
        layouts.push(applyWordStyles(words, runs, raster, 1));
        continue;
      }

      this.logger.log(`Page ${page} of ${pageCount} has no text layer; running OCR.`);
      // In colour, so the text and paper colours can be sampled for edits; Tesseract reads PPM directly
      const imagePath = await this.renderPage(pdfPath, page, path.join(workDir, `page-${page}`), {
        dpi: OCR_DPI,
        format: "ppm",
      });
      const raster = parsePpm(await readFile(imagePath));
      const scan = await this.readImage(imagePath, POINTS_PER_OCR_PIXEL, raster);
      pages.push(scan.text);
      layouts.push(scan.layout);
      ocrPages++;
    }
    return { text: pages.join("\n\n"), pageCount, ocrPages, pages: layouts };
  }

  // An uploaded photo or scan: OCR plus the colours of its words (TIFF can't be decoded here, so it gets none)
  async readUploadedImage(imagePath: string, contentType: string): Promise<ImageText> {
    const raster = decodeImage(await readFile(imagePath), contentType);
    return this.readImage(imagePath, 1, raster);
  }

  // Tesseract on one image, text and word boxes in one run; preserve_interword_spaces keeps table columns apart.
  // `scale` turns pixels into the page's units (1 for an uploaded image); `raster` is the image's pixels for styles.
  async readImage(imagePath: string, scale = 1, raster: Raster | null = null): Promise<ImageText> {
    const started = Date.now();
    const outputBase = `${imagePath}.ocr`;
    await runCommand("tesseract", [
      imagePath,
      outputBase,
      "-l",
      this.config.ocr.languages,
      "--psm",
      "3",
      "-c",
      "preserve_interword_spaces=1",
      "txt",
      "tsv",
    ]);
    const text = (await readFile(`${outputBase}.txt`, "utf8")).trim();
    const words = parseTesseractTsv(await readFile(`${outputBase}.tsv`, "utf8"), scale);
    const layout = applyWordStyles(words, null, raster, 1 / scale);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    this.logger.log(
      `OCR done. image=${path.basename(imagePath)} chars=${text.length} words=${layout.words.length} seconds=${seconds}`,
    );
    return { text, layout };
  }

  // One page as an image file (`<outputPrefix>.png` or `.jpg`); returns its path
  async renderPage(
    pdfPath: string,
    page: number,
    outputPrefix: string,
    { dpi, format, gray = false }: { dpi: number; format: "png" | "jpeg" | "ppm"; gray?: boolean },
  ): Promise<string> {
    const args = ["-f", String(page), "-l", String(page), "-r", String(dpi), "-singlefile"];
    // PPM is pdftoppm's default output, so it has no flag
    if (format !== "ppm") args.push(`-${format}`);
    if (gray) args.push("-gray");
    await runCommand("pdftoppm", [...args, pdfPath, outputPrefix]);
    const extension = { png: "png", jpeg: "jpg", ppm: gray ? "pgm" : "ppm" }[format];
    return `${outputPrefix}.${extension}`;
  }

  // Fonts, sizes and colours of a text-layer page; null when pdftohtml can't read it (edits then use defaults)
  private async readTextRuns(pdfPath: string, page: number, pageWidth: number): Promise<TextRun[] | null> {
    try {
      const pageArgs = ["-f", String(page), "-l", String(page)];
      const args = ["-xml", "-i", "-q", "-zoom", String(PDFTOHTML_ZOOM), ...pageArgs, "-stdout", pdfPath];
      return parsePdftohtml(await runCommand("pdftohtml", args), pageWidth);
    } catch (error) {
      this.logger.warn(`Fonts not read; edits use the default font. page=${page}: ${String(error)}`);
      return null;
    }
  }

  // The page's pixels for sampling colours; null when it can't be rendered
  private async renderRaster(pdfPath: string, page: number, outputPrefix: string, dpi: number): Promise<Raster | null> {
    try {
      return parsePpm(await readFile(await this.renderPage(pdfPath, page, outputPrefix, { dpi, format: "ppm" })));
    } catch (error) {
      this.logger.warn(`Page not rendered for colours; edits cover with white. page=${page}: ${String(error)}`);
      return null;
    }
  }

  async countPages(pdfPath: string): Promise<number> {
    const info = await runCommand("pdfinfo", [pdfPath]);
    const match = /^Pages:\s+(\d+)/m.exec(info);
    if (!match) throw new Error("pdfinfo did not report a page count; the PDF may be damaged");
    return Number(match[1]);
  }
}
