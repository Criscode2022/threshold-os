import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  const origin = process.env.WEB_ORIGIN || "http://localhost:4200";
  app.enableCors({ origin, credentials: true });
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, "0.0.0.0");
  console.log(`[threshold-api] listening on :${port}`);
}
bootstrap();
