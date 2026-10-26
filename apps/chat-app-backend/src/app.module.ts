import { ApiExceptionFilter, CommonModule, HttpThrottlerGuard } from "@app/common";
import { DbModule } from "@app/db";
import { NotificationsModule } from "@app/notifications";
import { RealtimeModule } from "@app/realtime";
import { StorageModule } from "@app/storage";
import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { RequestLoggerMiddleware, JwtAuthModule } from "backend-common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { CallsModule } from "./calls/calls.module.js";
import { ChatModule } from "./chat/chat.module.js";
import { FilesModule } from "./files/files.module.js";
import { GroupsModule } from "./groups/groups.module.js";
import { MessagesModule } from "./messages/messages.module.js";
import { PushModule } from "./push/push.module.js";
import { SeedModule } from "./seed/seed.module.js";
import { UsersModule } from "./users/users.module.js";

// 300 requests per 15 minutes per client, as before the NestJS move
const RATE_LIMIT = { ttl: 15 * 60 * 1000, limit: 300 };

@Module({
  imports: [
    // Infrastructure libraries (global)
    CommonModule,
    DbModule,
    StorageModule,
    JwtAuthModule,
    NotificationsModule,
    RealtimeModule,
    ThrottlerModule.forRoot([RATE_LIMIT]),
    // Features
    UsersModule,
    MessagesModule,
    FilesModule,
    GroupsModule,
    CallsModule,
    PushModule,
    ChatModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  // Every HTTP request is logged with its status and duration
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*path");
  }
}
