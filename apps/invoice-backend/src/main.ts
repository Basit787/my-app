import { appConfig, httpValidationPipe, type AppConfig } from "@app/common";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { securityHeaders, setupSwagger } from "backend-common";
import { AppModule } from "./app.module.js";
import { ExtractorService } from "./invoices/extractor.service.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Builder invoices carry their logo as a data URL
  app.useBodyParser("json", { limit: "10mb" });
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(securityHeaders());
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, {
    title: "Invoice API",
    description:
      "Invoices read from PDF, XML and image files (Tesseract OCR + a local model); status changes stream from `GET /events`.",
  });

  await app.listen(config.port);
  Logger.log(`Invoice server http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
  // Invoices a restart interrupted are read again
  void app.get(ExtractorService).resumePending();
}

await bootstrap();
