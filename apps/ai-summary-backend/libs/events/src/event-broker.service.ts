import { appConfig, type AppConfig } from "@app/common";
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { Redis } from "ioredis";

const channelFor = (userId: string) => `ai-summary:events:${userId}`;

// Redis pub/sub between summary jobs and each user's open event streams (works across server processes)
@Injectable()
export class EventBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBrokerService.name);
  private readonly publisher: Redis;

  constructor(@Inject(appConfig.KEY) config: AppConfig) {
    this.publisher = new Redis(config.redisUrl, { lazyConnect: true });
  }

  // Fails startup with a clear error when Redis is unreachable
  async onModuleInit() {
    await this.publisher.connect();
  }

  onModuleDestroy() {
    this.publisher.disconnect();
  }

  // Best effort: a lost event is recovered when the client reconnects and refetches
  async publish(userId: string, event: { type: string }): Promise<void> {
    try {
      const streams = await this.publisher.publish(channelFor(userId), JSON.stringify(event));
      this.logger.log(`Event published. type=${event.type} user=${userId} streams=${streams}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Event not published. type=${event.type} user=${userId}: ${message}`);
    }
  }

  // Calls `onEvent` with each event's JSON until the returned function is called
  async subscribe(userId: string, onEvent: (json: string) => void): Promise<() => void> {
    const subscriber = this.publisher.duplicate();
    subscriber.on("message", (_channel: string, json: string) => onEvent(json));
    await subscriber.subscribe(channelFor(userId));
    return () => subscriber.disconnect();
  }
}
