import { appConfig, type AppConfig } from "@app/common";
import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DbService } from "./db.service.js";
import { CallHistory, CallHistorySchema } from "./entities/call-history.entity.js";
import { ChatGroup, ChatGroupSchema } from "./entities/chat-group.entity.js";
import { Message, MessageSchema } from "./entities/message.entity.js";
import { PushToken, PushTokenSchema } from "./entities/push-token.entity.js";
import { SharedFile, SharedFileSchema } from "./entities/shared-file.entity.js";
import { UserPresence, UserPresenceSchema } from "./entities/user-presence.entity.js";
import { CallHistoryRepository } from "./repositories/call-history.repository.js";
import { ChatGroupRepository } from "./repositories/chat-group.repository.js";
import { MessageRepository } from "./repositories/message.repository.js";
import { PushTokenRepository } from "./repositories/push-token.repository.js";
import { SharedFileRepository } from "./repositories/shared-file.repository.js";
import { UserPresenceRepository } from "./repositories/user-presence.repository.js";

const repositories = [
  CallHistoryRepository,
  ChatGroupRepository,
  MessageRepository,
  PushTokenRepository,
  SharedFileRepository,
  UserPresenceRepository,
];

// The data layer: MongoDB connection, every entity and its repository; features only use repositories
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => ({ uri: config.mongodbUri }),
    }),
    MongooseModule.forFeature([
      { name: CallHistory.name, schema: CallHistorySchema },
      { name: ChatGroup.name, schema: ChatGroupSchema },
      { name: Message.name, schema: MessageSchema },
      { name: PushToken.name, schema: PushTokenSchema },
      { name: SharedFile.name, schema: SharedFileSchema },
      { name: UserPresence.name, schema: UserPresenceSchema },
    ]),
  ],
  providers: [DbService, ...repositories],
  exports: [DbService, ...repositories],
})
export class DbModule {}
