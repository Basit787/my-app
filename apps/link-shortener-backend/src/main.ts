import { appConfig, httpValidationPipe, type AppConfig } from "@app/common";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { securityHeaders, setupSwagger } from "backend-common";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(securityHeaders());
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, {
    title: "Link Shortener API",
    description: "Short links per user and their click stats; the public redirect is `GET /r/{slug}`.",
  });

  await app.listen(config.port);
  Logger.log(`Link shortener server http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
}

await bootstrap();
