import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { ChatGroup } from "../entities/chat-group.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class ChatGroupRepository extends BaseRepository<ChatGroup> {
  constructor(@InjectModel(ChatGroup.name) model: Model<ChatGroup>) {
    super(model);
  }

  // Most recently updated first
  findForMember(username: string) {
    return this.model.find({ members: username }).sort({ updatedAt: -1 }).exec();
  }

  findMembers(groupId: string) {
    return this.model.findById(groupId).select("members").lean().exec();
  }

  findNameAndMembers(groupId: string) {
    return this.model.findById(groupId).select("name members").lean().exec();
  }

  findMemberLists(username: string) {
    return this.model.find({ members: username }).select("members").lean().exec();
  }
}
