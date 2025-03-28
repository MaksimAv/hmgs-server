import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './shared/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.use(cookieParser());

  setupSwagger(app);

  const port = app.get(ConfigService).get<number>('APP_PORT', 4999);
  await app.listen(port);
}

void bootstrap();
