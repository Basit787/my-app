// Shared pieces (decorators, error filter, validation, DTOs, auth types, CORS) from backend-common
export {
  ApiExceptionFilter,
  corsOriginCallback,
  CurrentUser,
  ErrorResponseDto,
  httpValidationPipe,
  IS_PUBLIC,
  isAllowedOrigin,
  OkResponseDto,
  Public,
  type AuthenticatedRequest,
} from "backend-common";
export * from "./common.module.js";
export * from "./config/app.config.js";
export * from "./dto/responses.dto.js";
export * from "./guards/http-throttler.guard.js";
export * from "./pipes/validation.pipe.js";
export * from "./rooms/room.utils.js";
export type * from "./types/api.js";
export * from "./types/auth-user.js";
export type * from "./types/socket.js";
export type * from "./types/uploaded-file.js";
