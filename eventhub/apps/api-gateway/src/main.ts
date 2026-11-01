
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ZodValidationPipe());

  app.enableCors({
    origin: process.env.WEB_ORIGIN || "http://localhost:5173"
  });

  await app.listen(3000);
}

bootstrap();
