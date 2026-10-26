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
    title: "Image Upload API",
    description: "Images per user in MinIO, with scheduled publishing and a bin.",
  });

  await app.listen(config.port);
  Logger.log(`Image upload server http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
}

await bootstrap();
