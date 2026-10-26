// Shared pieces (decorators, error filter, validation, CORS, auth types) from backend-common
export {
  ApiExceptionFilter,
  corsOriginCallback,
  CurrentUser,
  httpValidationPipe,
  isAllowedOrigin,
  OkResponseDto,
  Public,
  type AuthUser,
  type Role,
} from "backend-common";
export * from "./common.module.js";
export * from "./config/app.config.js";
