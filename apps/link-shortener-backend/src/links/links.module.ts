import { Module } from "@nestjs/common";
import { LinksController } from "./links.controller.js";
import { LinksService } from "./links.service.js";
import { ShortLinksController } from "./short-links.controller.js";

@Module({
  controllers: [LinksController, ShortLinksController],
  providers: [LinksService],
})
export class LinksModule {}
