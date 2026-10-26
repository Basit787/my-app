import type { MessageFileDto, MessageType } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";

@Schema({ _id: false })
export class MessageFile implements MessageFileDto {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) mimeType!: string;
  @Prop({ required: true }) size!: number;
}

const MessageFileSchema = SchemaFactory.createForClass(MessageFile);

@Schema()
export class Message {
  @Prop({ required: true, index: true })
  room!: string;

  @Prop({ required: true })
  user!: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ type: String, enum: ["text", "file"], default: "text" })
  type!: MessageType;

  @Prop({ required: true, maxlength: 2000 })
  text!: string;

  @Prop({ type: MessageFileSchema, required: false })
  file?: MessageFile;

  // Soft delete: the text and file are cleared, receipts are kept
  @Prop({ default: false })
  deleted!: boolean;

  // Usernames whose client has received the message
  @Prop({ type: [String], default: [] })
  deliveredTo!: string[];

  // Usernames who have seen the message
  @Prop({ type: [String], default: [] })
  readBy!: string[];

  @Prop({ default: Date.now })
  at!: Date;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);
// Room history is read and receipt-updated by room + time
MessageSchema.index({ room: 1, at: 1 });
