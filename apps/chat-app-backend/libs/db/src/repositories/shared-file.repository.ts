import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { SharedFile } from "../entities/shared-file.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class SharedFileRepository extends BaseRepository<SharedFile> {
  constructor(@InjectModel(SharedFile.name) model: Model<SharedFile>) {
    super(model);
  }

  findInRoom(room: string, id: string) {
    return this.model.findOne({ _id: id, room }).lean().exec();
  }
}
