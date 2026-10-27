-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "invoice_source" AS ENUM ('XML', 'TEXT', 'OCR');

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'UPLOADED',
    "source" "invoice_source",
    "page_count" INTEGER,
    "extracted_text" TEXT,
    "error" TEXT,
    "invoice_number" VARCHAR(100),
    "invoice_date" VARCHAR(10),
    "due_date" VARCHAR(10),
    "vendor_name" VARCHAR(255),
    "vendor_address" VARCHAR(500),
    "vendor_tax_id" VARCHAR(100),
    "customer_name" VARCHAR(255),
    "customer_address" VARCHAR(500),
    "currency" VARCHAR(3),
    "subtotal" DECIMAL(14,2),
    "tax_amount" DECIMAL(14,2),
    "total_amount" DECIMAL(14,2),
    "line_items" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_storage_key_key" ON "invoices"("storage_key");

-- CreateIndex
CREATE INDEX "ix_invoices_user_id" ON "invoices"("user_id");

