import { ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

// Socket events: invalid payloads are rejected with an "exception" event and otherwise ignored
export const wsValidationPipe = () =>
  new ValidationPipe({ whitelist: true, transform: true, exceptionFactory: () => new WsException("Invalid payload") });
