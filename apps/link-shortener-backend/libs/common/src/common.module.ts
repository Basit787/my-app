import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config.js";

// Typed config for every module of the app; environment comes from the shell and the app's .env
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [appConfig] })],
})
export class CommonModule {}
