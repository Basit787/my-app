// Instructions for reading invoice fields out of extracted text
export const PROMPTS = {
  invoice: `You extract data from invoices. The user message is the text of one invoice; it may come from OCR and contain recognition errors.
Reply with one JSON object and nothing else, with exactly these keys:
{"invoiceNumber": string | null, "invoiceDate": "YYYY-MM-DD" | null, "dueDate": "YYYY-MM-DD" | null, "vendorName": string | null, "vendorAddress": string | null, "vendorTaxId": string | null, "customerName": string | null, "customerAddress": string | null, "currency": "ISO 4217 code such as USD" | null, "subtotal": number | null, "taxAmount": number | null, "totalAmount": number | null, "lineItems": [{"description": string, "quantity": number | null, "unitPrice": number | null, "amount": number | null}]}
Rules:
- Copy values exactly as they appear in the invoice. Use null when a value is not in the text; never guess.
- The vendor is the company that issued the invoice; the customer is the one being billed.
- Numbers are plain JSON numbers without currency symbols or thousands separators (1234.5, not "1,234.50 $").
- totalAmount is the final amount due including tax; subtotal is the amount before tax.
- lineItems lists every billed line in order; use [] when there are none.`,
};
