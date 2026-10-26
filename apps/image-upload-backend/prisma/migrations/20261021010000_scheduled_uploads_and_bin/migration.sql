-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('scheduled', 'active');

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_at" TIMESTAMP(3),
ADD COLUMN     "status" "ImageStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "images_deleted_at_idx" ON "images"("deleted_at");

