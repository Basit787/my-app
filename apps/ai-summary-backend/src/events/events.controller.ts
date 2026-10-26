import { CurrentUser, type AuthUser } from "@app/common";
import { Controller, Get, Header, StreamableFile } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiProduces, ApiTags } from "@nestjs/swagger";
import { EventsService } from "./events.service.js";

@ApiTags("Events")
@ApiBearerAuth()
@Controller("events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  // The client keeps this open and receives every change to its documents as `data: {json}` blocks
  @Get()
  @Header("Cache-Control", "no-cache")
  @Header("X-Accel-Buffering", "no")
  @ApiProduces("text/event-stream")
  @ApiOkResponse({ description: "document.updated / document.deleted events" })
  async stream(@CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const stream = await this.events.open(user.id);
    return new StreamableFile(stream, { type: "text/event-stream" });
  }
}
