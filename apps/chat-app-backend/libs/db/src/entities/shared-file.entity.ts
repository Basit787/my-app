import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

// Metadata of a chat attachment; the bytes live in MinIO under `storedName`
@Schema()
export class SharedFile {
  @Prop({ required: true, index: true }) room!: string;
  @Prop({ required: true }) user!: string;
  @Prop({ required: true, index: true }) userId!: string;
  @Prop({ required: true }) originalName!: string;
  @Prop({ required: true }) mimeType!: string;
  @Prop({ required: true }) size!: number;
  @Prop({ required: true, unique: true }) storedName!: string;
  @Prop({ default: Date.now }) at!: Date;
}

export type SharedFileDocument = HydratedDocument<SharedFile>;
export const SharedFileSchema = SchemaFactory.createForClass(SharedFile);
