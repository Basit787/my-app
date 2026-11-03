# Invoices UI — architecture

React + Vite + TanStack Router app on port `3014`; API at `/api` (invoice backend), auth at `/auth-api`.

## Routes

- `__root.tsx` — `AppProviders` from `frontend-common`.
- `_app.tsx` — `AuthGate`, then `useInvoiceEvents` keeps one SSE stream open for every page.
- `_app/index.tsx` — `InvoicesPage`: the invoices table and the upload dialog.
- `_app/invoices.$invoiceId.tsx` — `InvoiceDetailPage`: invoice list with previous / next, the file over its line items, the other fields in a resizable side panel.
- `_app/create.tsx` — `CreateInvoicePage`: the builder.
- `_app/profile.tsx` — `ProfilePage`: shared account settings, theme, sign out.

## Features

- `src/features/invoices/` — `api/` (`endpoint.ts`, `api.ts` with try/catch + `toApiError` and the SSE reader, `hooks.ts`: list, detail, file and page image URLs, edit plan, download, upload, update, re-extract, archive, restore, delete), the pages, form value types and `utils/` (form ↔ API mapping, amount and currency validation).
- `src/features/builder/` — `api/` (compose and download), `store/builder-store.ts` (zustand, persisted to `localStorage` as `invoice-builder` through `safeStorage`), block types and `utils/` (`BLOCK_CATALOG`, default design, totals, A4 page size).

## Components

- `invoices-table.tsx` — `MyUiDataTable` with an Active / Archived / All filter, row and bulk actions (archive, restore, delete with confirm); `invoices-tabs.tsx` switches between Invoices and Create.
- `upload-invoice-dialog.tsx` — PDF, XML, PNG, JPEG, TIFF up to `MAX_FILE_SIZE_MB`.
- `invoice-workspace.tsx` — one `useAppForm` form for the whole invoice: `invoice-viewer.tsx` (the file, or the live preview), `invoice-line-items-editor.tsx`, `invoice-side-panel.tsx` (status, `invoice-details-form.tsx`, Save, the extracted text).
- `invoice-file-view.tsx` / `invoice-pages.tsx` / `invoice-page-image.tsx` — a PDF as page images, other files as they are.
- `invoice-live-preview.tsx` + `edit-overlay.tsx` — the edit plan drawn over the page images in browser fonts matching the PDF standard fonts, following the form as the user types.
- `builder/` — `block-palette.tsx` (drag, or tap on touch screens), `invoice-canvas.tsx` (A4 page: drop, move, resize), `block-properties.tsx`, `invoice-data-panel.tsx`, `canvas-block.tsx`, `block-content.tsx`.

## State

- React Query holds the list and each invoice; pushed events write into those caches (no polling) and refetch an open invoice when it changes.
- The builder design lives in its zustand store and survives reloads.
