import {
  BadRequestException,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  ValidationPipe,
  type ArgumentsHost,
  type ExceptionFilter,
  type ValidationError,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// Body of every error reply; the clients read `error`
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[] | undefined>;
}

// Thrown outside Nest's own exceptions (e.g. upload filters); becomes `{ error, details? }` with this status
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Swagger shapes; explicit `type`s because this package is built without decorator metadata
export class ErrorResponseDto {
  @ApiProperty({ type: String, example: "Authentication required" })
  error!: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: { type: "array", items: { type: "string" } } })
  details?: Record<string, string[]>;
}

export class OkResponseDto {
  @ApiProperty({ type: Boolean, example: true })
  ok!: true;
}

// 400 `{ error: "Invalid request", details: { field: [messages] } }` for invalid DTOs
export const httpValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const details = Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));
      return new BadRequestException({ error: "Invalid request", details });
    },
  });

// Turns every error into `{ error, details? }` instead of Nest's default body
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  // Explicit token: this package is built without decorator metadata
  constructor(@Inject(HttpAdapterHost) private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== "http") return;
    const { httpAdapter } = this.adapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    if (httpAdapter.isHeadersSent(response)) return;

    const { status, body } = this.toReply(exception);
    httpAdapter.reply(response, body, status);
  }

  private toReply(exception: unknown): { status: number; body: ApiErrorResponse } {
    if (exception instanceof HttpError) {
      return { status: exception.statusCode, body: this.body(exception.message, exception.details) };
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") return { status: exception.getStatus(), body: this.body(response) };
      const { message, error, details } = response as {
        message?: string | string[];
        error?: string;
      } & ApiErrorResponse;
      // Our own exceptions carry `error`; Nest's built-ins put the text in `message`
      const text =
        details || !message ? (error ?? exception.message) : Array.isArray(message) ? message.join(", ") : message;
      return { status: exception.getStatus(), body: this.body(text, details) };
    }
    this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: this.body("Internal server error") };
  }

  private body(error: string, details?: ApiErrorResponse["details"]): ApiErrorResponse {
    return details ? { error, details } : { error };
  }
}
