import { appConfig, corsOriginCallback, httpValidationPipe, type AppConfig } from "@app/common";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { securityHeaders, setupSwagger } from "backend-common";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);

  app.setGlobalPrefix("api");
  app.use(securityHeaders());
  app.enableCors({ origin: corsOriginCallback(config) });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, {
    title: "Auth API",
    description: "Register and log in for a JWT; every API verifies it from the Authorization: Bearer header.",
  });

  await app.listen(config.port);
  Logger.log(`Auth service http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
}

await bootstrap();
