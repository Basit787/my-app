import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { Message } from "../entities/message.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class MessageRepository extends BaseRepository<Message> {
  constructor(@InjectModel(Message.name) model: Model<Message>) {
    super(model);
  }

  // Oldest first, capped at `limit`; DMs pass every alias of their room
  findInRooms(rooms: string[], limit: number) {
    return this.model
      .find({ room: { $in: rooms } })
      .sort({ at: 1 })
      .limit(limit)
      .lean()
      .exec();
  }

  findByIdLean(id: string) {
    return this.model.findById(id).lean().exec();
  }

  // Live messages from others that `reader` has not read yet, up to `upTo`
  findUnread(rooms: string[], reader: string, upTo: Date) {
    return this.model
      .find({
        room: { $in: rooms },
        user: { $ne: reader },
        deleted: { $ne: true },
        readBy: { $ne: reader },
        at: { $lte: upTo },
      })
      .select("user deliveredTo readBy")
      .lean()
      .exec();
  }

  async addDelivered(id: Types.ObjectId, username: string) {
    await this.model.updateOne({ _id: id }, { $addToSet: { deliveredTo: username } }).exec();
  }

  async markRead(ids: Types.ObjectId[], reader: string) {
    await this.model.updateMany({ _id: { $in: ids } }, { $addToSet: { readBy: reader, deliveredTo: reader } }).exec();
  }

  // Soft delete: text and file are cleared, receipts are kept
  softDelete(id: string) {
    return this.model
      .findByIdAndUpdate(id, { deleted: true, type: "text", file: undefined }, { new: true })
      .lean()
      .exec();
  }

  findDmRooms() {
    return this.model
      .find({ room: /^dm\.\./ })
      .select("room")
      .lean()
      .exec();
  }
}
