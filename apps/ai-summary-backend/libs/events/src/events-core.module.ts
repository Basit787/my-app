import { Global, Module } from "@nestjs/common";
import { EventBrokerService } from "./event-broker.service.js";

// Document events over Redis pub/sub for every feature
@Global()
@Module({
  providers: [EventBrokerService],
  exports: [EventBrokerService],
})
export class EventsCoreModule {}
