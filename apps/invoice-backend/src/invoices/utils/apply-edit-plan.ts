import { PDFDocument, rgb, type PDFFont, type StandardFonts } from "pdf-lib";
import type { EditPlan } from "../types/edit-plan.js";
import { CONTENT_TYPES } from "./content-types.js";
import { standardFontName } from "./standard-font-name.js";

// Where the baseline sits below the middle of a line box, as a share of the font size
const BASELINE_OFFSET = 0.26;

type EditedPdf = { pdf: Buffer; skipped: string[] };

// "#336699" as a pdf-lib colour
const hexColor = (hex: string) =>
  rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

// A PDF page holding the uploaded photo or scan at its own pixel size, so the layout's pixels are its points
const imageDocument = async (image: Buffer, contentType: string) => {
  const doc = await PDFDocument.create();
  const embedded = contentType === "image/png" ? await doc.embedPng(image) : await doc.embedJpg(image);
  const page = doc.addPage([embedded.width, embedded.height]);
  page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  return doc;
};

// The original file with every placement drawn on it: old values whited out, new ones written in their place
export const applyEditPlan = async (original: Buffer, contentType: string, plan: EditPlan): Promise<EditedPdf> => {
  const doc =
    contentType === CONTENT_TYPES.pdf
      ? await PDFDocument.load(original, { ignoreEncryption: true })
      : await imageDocument(original, contentType);
  // Each standard face is embedded once, the first time a placement needs it
  const fonts = new Map<StandardFonts, PDFFont>();
  const fontFor = async (name: StandardFonts) => {
    const embedded = fonts.get(name) ?? (await doc.embedFont(name));
    fonts.set(name, embedded);
    return embedded;
  };
  const skipped: string[] = [];

  for (const placement of plan.placements) {
    const page = doc.getPage(placement.page);
    if (page.getRotation().angle % 360 !== 0) {
      skipped.push(`${placement.field} (rotated page)`);
      continue;
    }
    // Layout boxes are top-left based on the visible (crop) area; PDF drawing is bottom-left based
    const crop = page.getCropBox();
    const layoutPage = plan.pages[placement.page];
    const scaleX = crop.width / layoutPage.width;
    const scaleY = crop.height / layoutPage.height;
    const toX = (x: number) => crop.x + x * scaleX;
    const toY = (y: number) => crop.y + crop.height - y * scaleY;

    for (const rect of placement.cover) {
      page.drawRectangle({
        x: toX(rect.x),
        y: toY(rect.y + rect.height),
        width: rect.width * scaleX,
        height: rect.height * scaleY,
        color: hexColor(rect.color),
      });
    }

    const font = await fontFor(standardFontName(placement));

    const size = placement.fontSize * scaleY;
    placement.lines.forEach((line, index) => {
      const width = font.widthOfTextAtSize(line, size);
      const lineTop = placement.y + index * placement.lineHeight;
      const baseline = lineTop + placement.boxHeight / 2 + placement.fontSize * BASELINE_OFFSET;
      const x = placement.align === "right" ? toX(placement.x) - width : toX(placement.x);
      page.drawText(line, { x, y: toY(baseline), size, font, color: hexColor(placement.color) });
    });
  }

  return { pdf: Buffer.from(await doc.save()), skipped };
};
