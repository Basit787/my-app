import { appConfig, httpValidationPipe, type AppConfig } from "@app/common";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { securityHeaders, setupSwagger } from "backend-common";
import { AppModule } from "./app.module.js";
import { SummarizerService } from "./documents/summarizer.service.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(securityHeaders());
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, {
    title: "AI Summary API",
    description: "Text documents summarized by a local model; status changes stream from `GET /events`.",
  });

  await app.listen(config.port);
  Logger.log(`AI summary server http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
  // Documents a restart interrupted are summarized again
  void app.get(SummarizerService).resumePending();
}

await bootstrap();
