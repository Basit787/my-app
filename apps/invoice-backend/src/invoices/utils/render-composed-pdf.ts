import { PDFDocument, rgb, type PDFFont, type PDFPage, type StandardFonts } from "pdf-lib";
import type { ComposeBlockDto } from "../dto/compose-block.dto.js";
import type { ComposeInvoiceDto } from "../dto/compose-invoice.dto.js";
import { computeComposedTotals } from "./compute-composed-totals.js";
import { formatMoney } from "./format-money.js";
import { standardFontName } from "./standard-font-name.js";
import { wrapText } from "./wrap-text.js";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
// Same numbers as the builder's canvas (apps/invoice-frontend/src/components/builder), so both look alike
const LINE_HEIGHT = 1.25;
const ASCENT = 0.8;
const LABEL_COLOR = "#666666";
// Line items columns as shares of the block width: description, quantity, unit price, amount
const COLUMNS = [0.5, 0.12, 0.19, 0.19];

const hexColor = (hex: string) =>
  rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

type TextOptions = {
  size: number;
  font: PDFFont;
  color: string;
  align: "left" | "center" | "right";
};

// Builder invoices as a one-page PDF: each block drawn where it was placed, in the chosen standard font
export const renderComposedPdf = async ({ blocks, data }: ComposeInvoiceDto): Promise<Buffer> => {
  const doc = await PDFDocument.create();
  doc.setTitle(data.invoiceNumber ? `Invoice ${data.invoiceNumber}` : "Invoice");
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts = new Map<StandardFonts, PDFFont>();
  const fontFor = async (style: { font: "sans" | "serif" | "mono"; bold: boolean; italic: boolean }) => {
    const name = standardFontName(style);
    const font = fonts.get(name) ?? (await doc.embedFont(name));
    fonts.set(name, font);
    return font;
  };
  const totals = computeComposedTotals(data);
  const money = (amount: number) => formatMoney(amount, data.currency);

  // Lines of text from `top`, wrapped to `width`; returns the y under the last line
  const drawLines = (target: PDFPage, text: string, x: number, top: number, width: number, options: TextOptions) => {
    const measure = (value: string, size: number) => options.font.widthOfTextAtSize(value, size);
    let y = top;
    for (const line of wrapText(text, width, options.size, measure)) {
      const lineWidth = measure(line, options.size);
      const offset =
        options.align === "right" ? width - lineWidth : options.align === "center" ? (width - lineWidth) / 2 : 0;
      target.drawText(line, {
        x: x + offset,
        y: PAGE_HEIGHT - (y + options.size * ASCENT),
        size: options.size,
        font: options.font,
        color: hexColor(options.color),
      });
      y += options.size * LINE_HEIGHT;
    }
    return y;
  };

  const drawBlock = async (block: ComposeBlockDto) => {
    const { style } = block;
    const font = await fontFor(style);
    const bold = await fontFor({ ...style, bold: true });
    const base: TextOptions = { size: style.fontSize, font, color: style.color, align: style.align };
    const label: TextOptions = { ...base, size: style.fontSize * 0.8, font: bold, color: LABEL_COLOR };

    switch (block.kind) {
      case "logo": {
        if (!block.imageDataUrl) return;
        const bytes = Buffer.from(block.imageDataUrl.split(",")[1], "base64");
        const image = block.imageDataUrl.startsWith("data:image/png")
          ? await doc.embedPng(bytes)
          : await doc.embedJpg(bytes);
        const height = block.height ?? (image.height / image.width) * block.width;
        page.drawImage(image, { x: block.x, y: PAGE_HEIGHT - block.y - height, width: block.width, height });
        return;
      }
      case "divider": {
        const thickness = block.height ?? 1;
        page.drawRectangle({
          x: block.x,
          y: PAGE_HEIGHT - block.y - thickness,
          width: block.width,
          height: thickness,
          color: hexColor(style.color),
        });
        return;
      }
      case "title":
      case "text":
        drawLines(page, block.text ?? "", block.x, block.y, block.width, base);
        return;
      case "details": {
        const rows = [
          ["Invoice number", data.invoiceNumber],
          ["Date", data.invoiceDate],
          ["Due date", data.dueDate],
        ].filter(([, value]) => value);
        drawLines(
          page,
          rows.map(([name, value]) => `${name}: ${value}`).join("\n"),
          block.x,
          block.y,
          block.width,
          base,
        );
        return;
      }
      case "from":
      case "billTo": {
        const isFrom = block.kind === "from";
        let y = drawLines(page, isFrom ? "FROM" : "BILL TO", block.x, block.y, block.width, label);
        const name = (isFrom ? data.vendorName : data.customerName) || "—";
        y = drawLines(page, name, block.x, y, block.width, { ...base, font: bold, size: style.fontSize * 1.1 });
        const address = isFrom ? data.vendorAddress : data.customerAddress;
        if (address) y = drawLines(page, address, block.x, y, block.width, base);
        if (isFrom && data.vendorTaxId) drawLines(page, `Tax ID: ${data.vendorTaxId}`, block.x, y, block.width, base);
        return;
      }
      case "lineItems": {
        const widths = COLUMNS.map((share) => share * block.width);
        const lefts = widths.map((_, index) => block.x + widths.slice(0, index).reduce((sum, w) => sum + w, 0));
        const cell = (text: string, column: number, top: number, options: TextOptions) =>
          drawLines(page, text, lefts[column] + (column ? 4 : 0), top, widths[column] - (column ? 4 : 0), options);

        const header = { ...label, align: "left" as const };
        cell("DESCRIPTION", 0, block.y, header);
        cell("QTY", 1, block.y, { ...header, align: "right" });
        cell("UNIT PRICE", 2, block.y, { ...header, align: "right" });
        let y = cell("AMOUNT", 3, block.y, { ...header, align: "right" }) + 2;
        page.drawRectangle({
          x: block.x,
          y: PAGE_HEIGHT - y,
          width: block.width,
          height: 0.75,
          color: hexColor("#cccccc"),
        });
        y += 6;

        for (const line of data.lineItems) {
          const right = { ...base, align: "right" as const };
          const bottom = cell(line.description || "—", 0, y, { ...base, align: "left" });
          cell(String(line.quantity), 1, y, right);
          cell(formatMoney(line.unitPrice, null), 2, y, right);
          cell(formatMoney(Math.round(line.quantity * line.unitPrice * 100) / 100, null), 3, y, right);
          y = bottom + 4;
        }
        return;
      }
      case "totals": {
        const rows: [string, number, boolean][] = [
          ["Subtotal", totals.subtotal, false],
          [`Tax (${data.taxRate}%)`, totals.taxAmount, false],
          ["Total", totals.totalAmount, true],
        ];
        let y = block.y;
        for (const [name, amount, isTotal] of rows) {
          const options = isTotal ? { ...base, font: bold, size: style.fontSize * 1.15 } : base;
          drawLines(page, name, block.x, y, block.width / 2, { ...options, align: "left" });
          y = drawLines(page, money(amount), block.x + block.width / 2, y, block.width / 2, {
            ...options,
            align: "right",
          });
          y += 2;
        }
        return;
      }
      case "notes": {
        if (!data.notes) return;
        const y = drawLines(page, "NOTES", block.x, block.y, block.width, label);
        drawLines(page, data.notes, block.x, y, block.width, base);
        return;
      }
    }
  };

  // In the builder's order, so later blocks draw over earlier ones as on its canvas
  for (const block of blocks) await drawBlock(block);
  return Buffer.from(await doc.save());
};
