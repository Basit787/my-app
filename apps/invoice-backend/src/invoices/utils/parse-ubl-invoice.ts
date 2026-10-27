import type { InvoiceFields } from "../types/invoice-fields.js";
import { toAmount } from "./to-amount.js";
import { toCurrency } from "./to-currency.js";
import { toIsoDate } from "./to-iso-date.js";
import { toLineItem } from "./to-line-item.js";
import { toText } from "./to-text.js";
import { xmlAt } from "./xml-at.js";
import { xmlList } from "./xml-list.js";
import { xmlText } from "./xml-text.js";

const partyName = (party: unknown) =>
  xmlText(xmlAt(party, "PartyLegalEntity", "RegistrationName")) ?? xmlText(xmlAt(party, "PartyName", "Name"));

const partyAddress = (party: unknown) => {
  const address = xmlAt(party, "PostalAddress");
  const parts = ["StreetName", "AdditionalStreetName", "CityName", "PostalZone", "CountrySubentity"].map((name) =>
    xmlText(xmlAt(address, name)),
  );
  parts.push(xmlText(xmlAt(address, "Country", "IdentificationCode")));
  return parts.filter(Boolean).join(", ");
};

const partyTaxId = (party: unknown) =>
  xmlText(xmlAt(party, "PartyTaxScheme", "CompanyID")) ?? xmlText(xmlAt(party, "PartyLegalEntity", "CompanyID"));

// UBL 2.1 invoices and credit notes (Peppol BIS, XRechnung UBL), namespace prefixes already removed
export const parseUblInvoice = (root: unknown): InvoiceFields => {
  const supplier = xmlAt(root, "AccountingSupplierParty", "Party");
  const customer = xmlAt(root, "AccountingCustomerParty", "Party");
  const totals = xmlAt(root, "LegalMonetaryTotal");
  const lines = xmlList(xmlAt(root, "InvoiceLine") ?? xmlAt(root, "CreditNoteLine"));

  return {
    invoiceNumber: toText(xmlText(xmlAt(root, "ID")), 100),
    invoiceDate: toIsoDate(xmlText(xmlAt(root, "IssueDate"))),
    dueDate: toIsoDate(xmlText(xmlAt(root, "DueDate")) ?? xmlText(xmlAt(root, "PaymentMeans", "PaymentDueDate"))),
    vendorName: toText(partyName(supplier), 255),
    vendorAddress: toText(partyAddress(supplier), 500),
    vendorTaxId: toText(partyTaxId(supplier), 100),
    customerName: toText(partyName(customer), 255),
    customerAddress: toText(partyAddress(customer), 500),
    currency: toCurrency(xmlText(xmlAt(root, "DocumentCurrencyCode"))),
    subtotal: toAmount(xmlText(xmlAt(totals, "TaxExclusiveAmount")) ?? xmlText(xmlAt(totals, "LineExtensionAmount"))),
    taxAmount: toAmount(xmlText(xmlAt(root, "TaxTotal", "TaxAmount"))),
    totalAmount: toAmount(xmlText(xmlAt(totals, "TaxInclusiveAmount")) ?? xmlText(xmlAt(totals, "PayableAmount"))),
    lineItems: lines.map((line) =>
      toLineItem({
        description: xmlText(xmlAt(line, "Item", "Name")) ?? xmlText(xmlAt(line, "Item", "Description")),
        quantity: xmlText(xmlAt(line, "InvoicedQuantity")) ?? xmlText(xmlAt(line, "CreditedQuantity")),
        unitPrice: xmlText(xmlAt(line, "Price", "PriceAmount")),
        amount: xmlText(xmlAt(line, "LineExtensionAmount")),
      }),
    ),
  };
};
