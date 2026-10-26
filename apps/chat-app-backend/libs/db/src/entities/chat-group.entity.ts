import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class ChatGroup {
  @Prop({ required: true, maxlength: 64, trim: true })
  name!: string;

  @Prop({ default: "", maxlength: 500, trim: true })
  description!: string;

  @Prop({ default: "" })
  image!: string;

  @Prop({ type: [String], required: true, index: true })
  members!: string[];

  @Prop({ required: true })
  createdBy!: string;

  // Set by `timestamps: true`
  createdAt!: Date;
  updatedAt!: Date;
}

export type ChatGroupDocument = HydratedDocument<ChatGroup>;
export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup);
