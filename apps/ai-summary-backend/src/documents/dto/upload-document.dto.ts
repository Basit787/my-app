import { ApiProperty } from "@nestjs/swagger";

// Multipart body of POST /documents/upload: one UTF-8 .txt file under `file`
export class UploadDocumentDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;
}
