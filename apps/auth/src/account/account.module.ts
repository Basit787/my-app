import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { createUploadOptions } from "backend-common";
import { AccountController } from "./account.controller.js";
import { AccountService } from "./account.service.js";

// Profile photo and account deletion
@Module({
  imports: [MulterModule.register(createUploadOptions({ maxFileSizeMb: 5, imagesOnly: true }))],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
