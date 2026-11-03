# Invoice API — architecture

NestJS 12 service on port `3013` (Swagger at `/docs`). Reads the fields of uploaded invoices (PDF, XML e-invoices, PNG/JPEG/TIFF scans), lets the user correct them, and writes the corrections back onto the original file as a PDF. It also saves invoices designed in the frontend's builder. Status changes reach the browser over Server-Sent Events.

## Layout

- `src/invoices/` — `InvoicesController` (`/invoices`), `InvoicesService` (upload, compose, list, get, file and page images, PDFs, edit plan, update, re-extract, archive, delete, the extraction queue and `resumePending`), DTOs, `types/`, and the stateless helpers in `utils/`:
  - Reading: `detectContentType`, `parseInvoiceXml` (`parseUblInvoice`, `parseCiiInvoice`), `toInvoiceFields`.
  - Editing the original: `planEdits` (find the old value's words, cover them, write the new value in the same font, size and colour), `applyEditPlan`, `findAmountWord`, `findDateWords`, `findTextWords`, `formatNumberLike`, `wrapText`.
  - New PDFs: `renderInvoicePdf` (a clean PDF of the saved data, for XML and TIFF which can't be drawn on), `renderComposedPdf` (builder invoices, same measurements as the builder canvas).
- `src/events/` — `GET /events`: one SSE stream per open page, fed from the user's Redis channel, with a ping every 15 s.
- `src/main.ts` — calls `InvoicesService.resumePending()` after start, so invoices left unfinished by a restart are read again.

## Libraries (`libs/`, `@app/<name>`)

- `@app/common` — `appConfig` and re-exports from `backend-common`.
- `@app/db` — `PrismaService`, `InvoiceRepository`; schema and migrations in `prisma/`.
- `@app/storage` — the shared S3 module on bucket `invoices`.
- `@app/events` — `EventBrokerService`: Redis pub/sub on `invoices:events:<userId>`.
- `@app/ocr` — `OcrService` around Poppler and Tesseract (through `runCommand`):
  - `readEmbeddedXml` — the XML attachment of Factur-X / ZUGFeRD / XRechnung PDFs (`pdfdetach`).
  - `readPdf` — each page from its text layer (`pdftotext`, fonts and colours from `pdftohtml`); pages with almost no text are rendered at 300 DPI (`pdftoppm`) and read with Tesseract.
  - `readUploadedImage` — Tesseract on a photo or scan, with the colour of each word sampled from the pixels (not for TIFF).
  - `countPages`, page rendering for the viewer.
- `@app/llm` — `InvoiceModelService`: LangChain `ChatOpenAI` at `{OLLAMA_URL}/v1`, temperature 0, returns the fields as JSON; long text keeps its start and its end (totals sit at the end) to fit the context.

## Extraction

- One invoice at a time (OCR and the model each use the whole CPU), queued in memory; each of the four steps is logged with the invoice id.
- XML is read exactly; a PDF uses its embedded XML when there is one, otherwise its text (text layer or OCR) goes to the model; images always go through OCR and the model. Builder invoices already know their fields and skip the model.
- The word positions of every page are saved next to the file (`<storageKey>.layout.json`) so later corrections can be drawn in place.
- A failure marks the invoice `FAILED` with the reason in `error`; `POST /invoices/:id/extract` tries again.

## Interfaces

- Endpoints: [api.md](api.md)
- Data: [data-model.md](data-model.md)
- Environment: [configuration.md](configuration.md)
