import { EventBrokerService } from "@app/events";
import { Injectable, Logger } from "@nestjs/common";
import { PassThrough } from "node:stream";

// Keeps proxies from closing a quiet stream
const KEEP_ALIVE_MS = 15_000;

// Server-Sent Events: one stream per open page, fed from the user's Redis channel
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly broker: EventBrokerService) {}

  async open(userId: string): Promise<PassThrough> {
    const stream = new PassThrough();
    const unsubscribe = await this.broker.subscribe(userId, (json) => stream.write(`data: ${json}\n\n`));
    // A comment line right away sends the headers, so the client knows the stream is open
    stream.write(": connected\n\n");
    const keepAlive = setInterval(() => stream.write(": ping\n\n"), KEEP_ALIVE_MS);
    this.logger.log(`Event stream opened. user=${userId}`);

    // Nest destroys the stream when the client disconnects
    stream.on("close", () => {
      clearInterval(keepAlive);
      unsubscribe();
      this.logger.log(`Event stream closed. user=${userId}`);
    });
    return stream;
  }
}
