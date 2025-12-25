import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors(corsConfig(configService));
  app.useGlobalPipes(new ValidationPipe());

  // Serve static files from uploads directory
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  await app.listen(3000);
}

void bootstrap();
