import PDFDocument from "pdfkit";
import type { InvoiceDto } from "../dto/invoice.dto.js";
import { formatMoney } from "./format-money.js";

const MARGIN = 50;
// Line item columns on an A4 page (595 points wide)
const COLUMNS = {
  description: { x: MARGIN, width: 245 },
  quantity: { x: 300, width: 55 },
  unitPrice: { x: 360, width: 90 },
  amount: { x: 455, width: 90 },
};
// Room left at the bottom of a page before a row moves to the next one
const PAGE_BOTTOM_SPACE = 100;

// A clean PDF of the invoice's current data, including the user's corrections
export const renderInvoicePdf = (invoice: InvoiceDto): Promise<Buffer> => {
  const doc = new PDFDocument({
    size: "A4",
    margin: MARGIN,
    info: { Title: invoice.invoiceNumber ?? invoice.filename },
  });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // Header: title on the left, number and dates on the right
  doc.font("Helvetica-Bold").fontSize(22).text("INVOICE", MARGIN, MARGIN);
  doc.font("Helvetica").fontSize(10);
  const meta = [
    ["Invoice number", invoice.invoiceNumber],
    ["Date", invoice.invoiceDate],
    ["Due date", invoice.dueDate],
  ].filter(([, value]) => value);
  meta.forEach(([label, value], index) => {
    doc.text(`${label}: ${value}`, 300, MARGIN + index * 14, { width: 245, align: "right" });
  });

  // Vendor and customer side by side
  const partiesTop = MARGIN + 70;
  const party = (title: string, name: string | null, address: string | null, x: number, extra?: string | null) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#666666")
      .text(title.toUpperCase(), x, partiesTop, { width: 230 });
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#000000")
      .text(name ?? "—", x, doc.y + 2, { width: 230 });
    doc.font("Helvetica").fontSize(10);
    if (address) doc.text(address, x, doc.y, { width: 230 });
    if (extra) doc.text(`Tax ID: ${extra}`, x, doc.y, { width: 230 });
    return doc.y;
  };
  const vendorBottom = party("From", invoice.vendorName, invoice.vendorAddress, MARGIN, invoice.vendorTaxId);
  const customerBottom = party("Bill to", invoice.customerName, invoice.customerAddress, 315);
  let y = Math.max(vendorBottom, customerBottom) + 30;

  // Line items table
  const headerRow = (top: number) => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#666666");
    doc.text("DESCRIPTION", COLUMNS.description.x, top, { width: COLUMNS.description.width });
    doc.text("QTY", COLUMNS.quantity.x, top, { width: COLUMNS.quantity.width, align: "right" });
    doc.text("UNIT PRICE", COLUMNS.unitPrice.x, top, { width: COLUMNS.unitPrice.width, align: "right" });
    doc.text("AMOUNT", COLUMNS.amount.x, top, { width: COLUMNS.amount.width, align: "right" });
    doc
      .moveTo(MARGIN, top + 14)
      .lineTo(545, top + 14)
      .strokeColor("#cccccc")
      .stroke();
    doc.fillColor("#000000").font("Helvetica").fontSize(10);
    return top + 22;
  };
  y = headerRow(y);

  for (const line of invoice.lineItems) {
    if (y > doc.page.height - PAGE_BOTTOM_SPACE) {
      doc.addPage();
      y = headerRow(MARGIN);
    }
    doc.text(line.description || "—", COLUMNS.description.x, y, { width: COLUMNS.description.width });
    const rowBottom = doc.y;
    const quantity = line.quantity === null ? "" : String(line.quantity);
    doc.text(quantity, COLUMNS.quantity.x, y, { width: COLUMNS.quantity.width, align: "right" });
    doc.text(formatMoney(line.unitPrice, null), COLUMNS.unitPrice.x, y, {
      width: COLUMNS.unitPrice.width,
      align: "right",
    });
    doc.text(formatMoney(line.amount, null), COLUMNS.amount.x, y, { width: COLUMNS.amount.width, align: "right" });
    y = rowBottom + 6;
  }
  if (!invoice.lineItems.length) {
    doc.fillColor("#666666").text("No line items", COLUMNS.description.x, y).fillColor("#000000");
    y = doc.y + 6;
  }

  // Totals, right-aligned under the table
  if (y > doc.page.height - PAGE_BOTTOM_SPACE) {
    doc.addPage();
    y = MARGIN;
  }
  doc.moveTo(300, y).lineTo(545, y).strokeColor("#cccccc").stroke();
  y += 8;
  const totals: [string, number | null, boolean][] = [
    ["Subtotal", invoice.subtotal, false],
    ["Tax", invoice.taxAmount, false],
    ["Total", invoice.totalAmount, true],
  ];
  for (const [label, amount, bold] of totals) {
    if (amount === null) continue;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10);
    doc.text(label, 300, y, { width: 120 });
    doc.text(formatMoney(amount, invoice.currency), 420, y, { width: 125, align: "right" });
    y = doc.y + 4;
  }

  if (invoice.notes) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#666666")
      .text("NOTES", MARGIN, y + 20);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#000000")
      .text(invoice.notes, MARGIN, doc.y + 2, { width: 495 });
  }

  doc.end();
  return done;
};
