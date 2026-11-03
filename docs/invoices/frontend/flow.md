# Invoices UI — flows

## Upload and review

1. Upload posts the file to `/api/invoices/upload`; the row appears as Uploaded.
2. Pushed events move it to Processing and then Completed (toast "Invoice read: <file>") or Failed with the reason (error toast).
3. Opening a row shows the file (PDF pages as images from `/api/invoices/:id/pages/:page`) with the fields read from it.
4. If the stream drops, `useInvoiceEvents` reconnects and refetches the list once.

## Correcting and downloading

1. The viewer has Original and Live preview tabs. In the preview, after a short pause in typing the form's values go to `/api/invoices/:id/edit-plan`, and the overlay draws them where the old values are printed; values that could not be placed are listed.
2. Save sends `PATCH /api/invoices/:id`; "Read again" (after a confirm) runs extraction again and replaces the fields.
3. Download offers the original file, or the PDF with the corrections (`POST /api/invoices/:id/pdf` with the current form values).

## Building an invoice

1. On Create, blocks are dragged (or tapped) from the palette onto the A4 canvas, then moved, resized and styled; the right panel holds the invoice data and line items, with totals computed from the tax rate.
2. The design is kept in `localStorage` between visits; Reset starts over.
3. Download renders it through `/api/invoices/compose/pdf` without saving; Save posts `/api/invoices/compose` and the invoice joins the list.
