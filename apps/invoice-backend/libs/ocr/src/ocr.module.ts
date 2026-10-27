import { Global, Module } from "@nestjs/common";
import { OcrService } from "./ocr.service.js";

// Tesseract and Poppler (installed in the image) for every feature
@Global()
@Module({
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
