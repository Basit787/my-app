import { ApiExceptionFilter, CommonModule } from "@app/common";
import { DbModule } from "@app/db";
import { EventsCoreModule } from "@app/events";
import { LlmModule } from "@app/llm";
import { OcrModule } from "@app/ocr";
import { StorageCoreModule } from "@app/storage";
import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { RequestLoggerMiddleware, JwtAuthModule } from "backend-common";
import { EventsModule } from "./events/events.module.js";
import { InvoicesModule } from "./invoices/invoices.module.js";

@Module({
  imports: [
    // Infrastructure libraries (global)
    CommonModule,
    DbModule,
    JwtAuthModule,
    StorageCoreModule,
    EventsCoreModule,
    LlmModule,
    OcrModule,
    // Features
    InvoicesModule,
    EventsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule implements NestModule {
  // Every HTTP request is logged with its status and duration
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*path");
  }
}
