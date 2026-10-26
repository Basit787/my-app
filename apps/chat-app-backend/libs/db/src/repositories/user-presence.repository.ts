import type { PresenceStatus } from "@app/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { UserPresence } from "../entities/user-presence.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class UserPresenceRepository extends BaseRepository<UserPresence> {
  constructor(@InjectModel(UserPresence.name) model: Model<UserPresence>) {
    super(model);
  }

  async findStatus(username: string): Promise<PresenceStatus | undefined> {
    return (await this.model.findOne({ username }).lean().exec())?.status;
  }

  async findStatuses(usernames: string[]): Promise<Map<string, PresenceStatus>> {
    const docs = await this.model
      .find({ username: { $in: usernames } })
      .lean()
      .exec();
    return new Map(docs.map((doc) => [doc.username, doc.status]));
  }

  // Everyone who has ever connected to the chat
  async findAllUsernames(): Promise<string[]> {
    return this.model.distinct("username").exec();
  }

  async saveStatus(username: string, status: PresenceStatus) {
    await this.model.findOneAndUpdate({ username }, { status, updatedAt: new Date() }, { upsert: true }).exec();
  }
}
