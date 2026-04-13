import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const prefix = configService.get<string>('API_PREFIX') ?? 'api';
  const corsOrigin = configService.get<string>('CORS_ORIGIN') ?? '*';

  app.setGlobalPrefix(prefix);
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = configService.get<number>('PORT') ?? 3333;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
