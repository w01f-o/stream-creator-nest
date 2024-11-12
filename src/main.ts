import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:63342',
    methods: 'GET,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
