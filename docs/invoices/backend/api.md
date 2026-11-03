# Invoice API — endpoints

Base URL `http://localhost:3013` (the UI calls `/api/...`); Swagger at `/docs`. Every route needs a bearer token and only sees the caller's invoices. Errors are `{ error, details? }`.

## Invoices

- `GET /invoices` → `Invoice[]` (newest first, archived included)
- `POST /invoices/upload` (multipart `file`: PDF, XML, PNG, JPEG or TIFF, up to `MAX_FILE_SIZE_MB`) → `201 Invoice` with status `UPLOADED`; the fields are read in the background
- `GET /invoices/:id` → `InvoiceDetail` (`Invoice` plus `extractedText`)
- `PATCH /invoices/:id` `InvoiceUpdate` → `Invoice`; `409` while the invoice is being read
- `POST /invoices/:id/extract` → `202 Invoice`; reads the file again, replacing the fields and any corrections; `409` while it is being read
- `POST /invoices/:id/archive`, `POST /invoices/:id/restore` → `Invoice` (file and data are kept)
- `DELETE /invoices/:id` → `{ message }`; also deletes the file, page images and word layout

## Files and PDFs

- `GET /invoices/:id/file` → the uploaded file
- `GET /invoices/:id/pages/:page` → one page of an uploaded PDF as a JPEG (1-based; rendered once, then cached in S3)
- `GET /invoices/:id/pdf` → the invoice as a PDF: the original with the saved corrections drawn in (PDF, PNG, JPEG), or a generated invoice (XML, TIFF)
- `POST /invoices/:id/pdf` `InvoiceUpdate` → the same with unsaved changes applied; nothing is saved
- `POST /invoices/:id/edit-plan` `InvoiceUpdate` → `EditPlan`: where each changed value would be drawn on the original, for the live preview; nothing is saved

## Builder

- `POST /invoices/compose` `{ blocks, data }` → `201 Invoice`: renders the design as a PDF and saves it like an upload
- `POST /invoices/compose/pdf` `{ blocks, data }` → `application/pdf`; nothing is saved
- `blocks`: placed blocks of kind `logo`, `title`, `text`, `details`, `from`, `billTo`, `lineItems`, `totals`, `notes`, `divider` with position, size and style; `data`: `{ invoiceNumber?, invoiceDate?, dueDate?, currency, vendor…, customer…, taxRate, notes?, lineItems }`

## Live updates

- `GET /events` → `text/event-stream`; each event is `data: { type: "invoice.updated", invoice }` or `data: { type: "invoice.deleted", id }`

## Types

- `Invoice`: `{ id, filename, contentType, size, status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED", source: "XML" | "TEXT" | "OCR" | null, pageCount, error, invoiceNumber, invoiceDate, dueDate, vendorName, vendorAddress, vendorTaxId, customerName, customerAddress, currency, subtotal, taxAmount, totalAmount, lineItems, notes, archivedAt, createdAt, updatedAt }`
- `LineItem`: `{ description, quantity, unitPrice, amount }`
- `InvoiceUpdate`: any of the editable fields above (`null` clears one); dates are `YYYY-MM-DD`, `currency` ISO 4217
- `EditPlan`: `{ supported, reason, pages: { width, height }[], placements, unplaced }`; `unplaced` lists changes whose old value was not found on the original
