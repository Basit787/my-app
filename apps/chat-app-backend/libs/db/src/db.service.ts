import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

// Collections cleared by `pnpm db:reset`; accounts belong to the auth service
const RESET_COLLECTIONS = ["messages", "sharedfiles"];

@Injectable()
export class DbService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Deletes every message and file record (MinIO objects are left in place)
  async reset() {
    const db = this.connection.getClient().db();
    await Promise.all(RESET_COLLECTIONS.map((name) => db.collection(name).deleteMany({})));
  }
}
