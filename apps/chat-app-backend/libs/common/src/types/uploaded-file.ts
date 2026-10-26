// What FileInterceptor's in-memory storage hands to @UploadedFile()
export type UploadedFileData = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
