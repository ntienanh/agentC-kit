import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { createValidationPipe } from './core/pipes/validation.pipe';
import { setupSwagger } from './core/swagger/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(cookieParser());

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3333',
    'http://localhost:3848',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3333',
    'http://127.0.0.1:3848',
  ];
  const allowedOrigins = configService.get<string>('CORS_ORIGINS');
  app.enableCors({
    origin: allowedOrigins
      ? allowedOrigins
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : defaultOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-tenant-id',
      'x-trace-id',
      'x-correlation-id',
      'x-request-id',
    ],
  });

  app.enableShutdownHooks();

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(createValidationPipe());
  setupSwagger(app);

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(
    `📚 Swagger Documentation is available at: http://localhost:${port}/docs`,
  );
}
void bootstrap();
