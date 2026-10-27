import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { InvoiceFields } from "../types/invoice-fields.js";
import { parseCiiInvoice } from "./parse-cii-invoice.js";
import { parseUblInvoice } from "./parse-ubl-invoice.js";

// Values stay strings ("00123" keeps its zeros); prefixes go, so ubl:Invoice and Invoice read the same
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
});

// Fields of a UBL or CII e-invoice, read exactly; null for other XML, which then goes to the model as text
export const parseInvoiceXml = (xml: string): InvoiceFields | null => {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    throw new Error(`Invalid XML at line ${validation.err.line}: ${validation.err.msg}`);
  }

  const parsed = parser.parse(xml) as Record<string, unknown>;
  if (parsed.Invoice) return parseUblInvoice(parsed.Invoice);
  if (parsed.CreditNote) return parseUblInvoice(parsed.CreditNote);
  if (parsed.CrossIndustryInvoice) return parseCiiInvoice(parsed.CrossIndustryInvoice);
  return null;
};
