import { Module } from "@nestjs/common";
import { CallsModule } from "../calls/calls.module.js";
import { GroupsModule } from "../groups/groups.module.js";
import { MessagesModule } from "../messages/messages.module.js";
import { UsersModule } from "../users/users.module.js";
import { ChatGateway } from "./chat.gateway.js";

@Module({
  imports: [UsersModule, MessagesModule, GroupsModule, CallsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
