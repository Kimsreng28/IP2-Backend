import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Update to the port where your Next.js app runs
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
