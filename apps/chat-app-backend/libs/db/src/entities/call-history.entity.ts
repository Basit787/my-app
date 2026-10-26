import type { CallStatus, CallType } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: false })
export class CallHistory {
  @Prop({ required: true, index: true }) caller!: string;
  @Prop({ required: true, index: true }) callee!: string;
  @Prop({ type: String, enum: ["audio", "video"], required: true }) callType!: CallType;
  @Prop({ type: String, enum: ["completed", "missed", "rejected", "cancelled"], required: true }) status!: CallStatus;
  @Prop({ required: true }) startedAt!: Date;
  @Prop({ required: true }) endedAt!: Date;
  @Prop() durationSeconds?: number;
}

export const CallHistorySchema = SchemaFactory.createForClass(CallHistory);
CallHistorySchema.index({ caller: 1, startedAt: -1 });
CallHistorySchema.index({ callee: 1, startedAt: -1 });
