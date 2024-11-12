import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((_req, res: Response, next: NextFunction) => {
    res.setHeader(
      'Content-Security-Policy',
      "connect-src 'self' https://w01f-server.ru:8080",
    );
    next();
  });

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
