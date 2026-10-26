import { Injectable, Logger, type INestApplication, type NestMiddleware } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import type { IncomingMessage, ServerResponse } from "node:http";

// One log line per request once the reply is sent: method, path, status and duration
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(request: IncomingMessage, response: ServerResponse, next: () => void) {
    const started = Date.now();
    response.on("finish", () => {
      const line = `${request.method} ${request.url} ${response.statusCode} ${Date.now() - started}ms`;
      if (response.statusCode >= 500) this.logger.error(line);
      else if (response.statusCode >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });
    next();
  }
}

// helmet: cross-origin files (images, avatars) and Swagger UI's inline scripts, styles and badge
export const securityHeaders = () =>
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // HSTS only in production: over dev HTTPS it would force https on every localhost port
    strictTransportSecurity: process.env.NODE_ENV === "production",
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://validator.swagger.io"],
      },
    },
  });

// Swagger UI at /docs (spec at /docs/openapi.json), generated from the controllers and DTOs
export const setupSwagger = (app: INestApplication, { title, description }: { title: string; description: string }) => {
  const auth =
    "**Authentication:** get a token from the auth service (`POST /api/auth/login`) and paste it into Authorize.";
  const config = new DocumentBuilder()
    .setTitle(title)
    .setVersion("1.0.0")
    .setDescription(`${description}\n\n${auth}`)
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: "docs/openapi.json",
    customSiteTitle: title,
    swaggerOptions: { persistAuthorization: true },
  });
};
