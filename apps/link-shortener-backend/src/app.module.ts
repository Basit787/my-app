import { ApiExceptionFilter, CommonModule } from "@app/common";
import { DbModule } from "@app/db";
import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { RequestLoggerMiddleware, JwtAuthModule } from "backend-common";
import { LinksModule } from "./links/links.module.js";

@Module({
  imports: [
    // Infrastructure libraries (global)
    CommonModule,
    DbModule,
    JwtAuthModule,
    // Features
    LinksModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule implements NestModule {
  // Every HTTP request is logged with its status and duration
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*path");
  }
}
