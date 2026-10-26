import type { PresenceStatus } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// The status a user picked (online / away / busy / offline); being connected is tracked in memory
@Schema({ versionKey: false })
export class UserPresence {
  @Prop({ required: true, unique: true, index: true })
  username!: string;

  @Prop({ type: String, enum: ["online", "away", "busy", "offline"], default: "online" })
  status!: PresenceStatus;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const UserPresenceSchema = SchemaFactory.createForClass(UserPresence);
