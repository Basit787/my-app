import type { InvoiceFields } from "../types/invoice-fields.js";
import { toAmount } from "./to-amount.js";
import { toCurrency } from "./to-currency.js";
import { toIsoDate } from "./to-iso-date.js";
import { toLineItem } from "./to-line-item.js";
import { toText } from "./to-text.js";
import { xmlAt } from "./xml-at.js";
import { xmlList } from "./xml-list.js";
import { xmlText } from "./xml-text.js";

const partyAddress = (party: unknown) => {
  const address = xmlAt(party, "PostalTradeAddress");
  const parts = ["LineOne", "LineTwo", "CityName", "PostcodeCode", "CountryID"].map((name) =>
    xmlText(xmlAt(address, name)),
  );
  return parts.filter(Boolean).join(", ");
};

// UN/CEFACT Cross Industry Invoice: Factur-X, ZUGFeRD and XRechnung CII, namespace prefixes already removed
export const parseCiiInvoice = (root: unknown): InvoiceFields => {
  const document = xmlAt(root, "ExchangedDocument");
  const transaction = xmlAt(root, "SupplyChainTradeTransaction");
  const seller = xmlAt(transaction, "ApplicableHeaderTradeAgreement", "SellerTradeParty");
  const buyer = xmlAt(transaction, "ApplicableHeaderTradeAgreement", "BuyerTradeParty");
  const settlement = xmlAt(transaction, "ApplicableHeaderTradeSettlement");
  const sums = xmlAt(settlement, "SpecifiedTradeSettlementHeaderMonetarySummation");
  const lines = xmlList(xmlAt(transaction, "IncludedSupplyChainTradeLineItem"));

  return {
    invoiceNumber: toText(xmlText(xmlAt(document, "ID")), 100),
    invoiceDate: toIsoDate(xmlText(xmlAt(document, "IssueDateTime", "DateTimeString"))),
    dueDate: toIsoDate(xmlText(xmlAt(settlement, "SpecifiedTradePaymentTerms", "DueDateDateTime", "DateTimeString"))),
    vendorName: toText(xmlText(xmlAt(seller, "Name")), 255),
    vendorAddress: toText(partyAddress(seller), 500),
    vendorTaxId: toText(xmlText(xmlAt(seller, "SpecifiedTaxRegistration", "ID")), 100),
    customerName: toText(xmlText(xmlAt(buyer, "Name")), 255),
    customerAddress: toText(partyAddress(buyer), 500),
    currency: toCurrency(xmlText(xmlAt(settlement, "InvoiceCurrencyCode"))),
    subtotal: toAmount(xmlText(xmlAt(sums, "TaxBasisTotalAmount")) ?? xmlText(xmlAt(sums, "LineTotalAmount"))),
    taxAmount: toAmount(xmlText(xmlAt(sums, "TaxTotalAmount"))),
    totalAmount: toAmount(xmlText(xmlAt(sums, "GrandTotalAmount")) ?? xmlText(xmlAt(sums, "DuePayableAmount"))),
    lineItems: lines.map((line) =>
      toLineItem({
        description: xmlText(xmlAt(line, "SpecifiedTradeProduct", "Name")),
        quantity: xmlText(xmlAt(line, "SpecifiedLineTradeDelivery", "BilledQuantity")),
        unitPrice: xmlText(xmlAt(line, "SpecifiedLineTradeAgreement", "NetPriceProductTradePrice", "ChargeAmount")),
        amount: xmlText(
          xmlAt(
            line,
            "SpecifiedLineTradeSettlement",
            "SpecifiedTradeSettlementLineMonetarySummation",
            "LineTotalAmount",
          ),
        ),
      }),
    ),
  };
};
