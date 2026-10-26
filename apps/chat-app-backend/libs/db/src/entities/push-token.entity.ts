import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// An Expo push token of one device; a user has one per signed-in phone
@Schema({ timestamps: true })
export class PushToken {
  @Prop({ required: true, unique: true }) token!: string;
  @Prop({ required: true, index: true }) username!: string;
  @Prop({ default: "" }) platform!: string;
}

export const PushTokenSchema = SchemaFactory.createForClass(PushToken);
