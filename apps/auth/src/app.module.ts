import { ApiExceptionFilter, appConfig, CommonModule, type AppConfig } from "@app/common";
import { DbModule } from "@app/db";
import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { JwtAuthModule, ObjectStorageModule, RequestLoggerMiddleware } from "backend-common";
import { AccountModule } from "./account/account.module.js";
import { AuthModule } from "./auth/auth.module.js";

@Module({
  imports: [
    CommonModule,
    DbModule,
    JwtAuthModule,
    ObjectStorageModule.forRoot({ inject: [appConfig.KEY], useFactory: (config: AppConfig) => config.minio }),
    AuthModule,
    AccountModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule implements NestModule {
  // Every HTTP request is logged with its status and duration
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*path");
  }
}
