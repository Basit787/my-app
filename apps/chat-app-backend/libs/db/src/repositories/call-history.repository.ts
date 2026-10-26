import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { CallHistory } from "../entities/call-history.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class CallHistoryRepository extends BaseRepository<CallHistory> {
  constructor(@InjectModel(CallHistory.name) model: Model<CallHistory>) {
    super(model);
  }

  // Newest first; with `peer`, only calls between the two users
  findForUser(username: string, limit: number, peer?: string) {
    const filter = peer
      ? {
          $or: [
            { caller: username, callee: peer },
            { caller: peer, callee: username },
          ],
        }
      : { $or: [{ caller: username }, { callee: username }] };
    return this.model.find(filter).sort({ startedAt: -1 }).limit(limit).lean().exec();
  }

  findParticipantsFor(username: string) {
    return this.model
      .find({ $or: [{ caller: username }, { callee: username }] })
      .select("caller callee")
      .lean()
      .exec();
  }
}
