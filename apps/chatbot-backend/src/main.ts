import { appConfig, httpValidationPipe, type AppConfig } from "@app/common";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { setupSwagger } from "backend-common";
import helmet from "helmet";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(
    helmet({
      strictTransportSecurity: process.env.NODE_ENV === "production",
      // Swagger UI needs inline scripts/styles and the validator badge image
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        },
      },
    }),
  );
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app, {
    title: "Chatbot API",
    description:
      "Conversations with a local AI model (Ollama) through LangGraph; messages are persisted per conversation.",
  });

  await app.listen(config.port);
  Logger.log(`Chatbot server http://localhost:${config.port} (docs at /docs)`, "Bootstrap");
}

await bootstrap();
