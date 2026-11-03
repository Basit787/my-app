# Invoice API — data model

PostgreSQL database `invoices` through Prisma (`prisma/schema.prisma`, migrations in `prisma/migrations/`, applied on start).

## `invoices`

- File: `id` (uuid), `user_id` (indexed), `filename`, `storage_key` (S3 key, unique), `content_type`, `size`
- Reading: `status` (`UPLOADED` → `PROCESSING` → `COMPLETED` | `FAILED`), `source` (`XML` | `TEXT` | `OCR`), `page_count`, `extracted_text`, `error` (why the last reading failed)
- Fields: `invoice_number`, `invoice_date`, `due_date` (`YYYY-MM-DD`), `vendor_name`, `vendor_address`, `vendor_tax_id`, `customer_name`, `customer_address`, `currency` (ISO 4217), `subtotal`, `tax_amount`, `total_amount` (decimal 14,2), `line_items` (JSON `[{ description, quantity, unitPrice, amount }]`), `notes`
- `extracted_fields` (JSON) — the fields as first read, used to find the old values on the original when corrections are drawn
- `archived_at` — set while archived; `created_at`, `updated_at`

## S3 bucket `invoices`

- `<userId>/<uuid>.<ext>` — the uploaded (or composed) file
- `<storageKey>.layout.json` — word positions, fonts and colours of every page
- `<storageKey>.pages/` — JPEG page previews, rendered on first view
- Deleting an invoice removes everything under its `storageKey` prefix.

## Redis

- Channel `invoices:events:<userId>` — `invoice.updated` / `invoice.deleted` for the user's open streams.

Change the schema, then `pnpm --filter @chat/invoice-backend db:migrate`.
