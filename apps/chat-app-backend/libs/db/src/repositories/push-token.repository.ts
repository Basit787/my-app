import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { PushToken } from "../entities/push-token.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class PushTokenRepository extends BaseRepository<PushToken> {
  constructor(@InjectModel(PushToken.name) model: Model<PushToken>) {
    super(model);
  }

  // A device token belongs to whoever registered it last
  async upsert(token: string, username: string, platform: string) {
    await this.model.updateOne({ token }, { $set: { username, platform } }, { upsert: true }).exec();
  }

  async removeForUser(token: string, username: string) {
    await this.model.deleteOne({ token, username }).exec();
  }

  async findTokens(usernames: string[]): Promise<string[]> {
    const docs = await this.model
      .find({ username: { $in: usernames } })
      .select("token")
      .lean()
      .exec();
    return docs.map((doc) => doc.token);
  }
}
