import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ApiErrorResponseDto, ValidationErrorDetailDto } from '@shared/dto';

export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  enabled?: boolean;
  bearerAuthName?: string;
}

export function setupSwagger(
  app: INestApplication,
  options?: SwaggerOptions,
): void {
  const logger = new Logger('SwaggerEngine');
  const configService = app.get(ConfigService, { strict: false });

  const isEnabled =
    options?.enabled ??
    configService?.get<boolean>('SWAGGER_ENABLED', true) ??
    process.env.NODE_ENV !== 'production';

  if (!isEnabled) {
    logger.log('🚫 Swagger UI is disabled for this environment.');
    return;
  }

  const path =
    options?.path ??
    configService?.get<string>('SWAGGER_PATH', 'docs') ??
    'docs';
  const title =
    options?.title ??
    configService?.get<string>('SWAGGER_TITLE', 'NestJS Enterprise API') ??
    'NestJS Enterprise API';
  const version =
    options?.version ??
    configService?.get<string>('SWAGGER_VERSION', '1.0.0') ??
    '1.0.0';
  const authName = options?.bearerAuthName ?? 'bearer-auth';

  const defaultDescription = [
    `# ${title} Documentation`,
    '',
    'Tài liệu API Enterprise chính thức xây dựng trên nền tảng Clean Architecture & Modular Monolith.',
    '',
    '### 🔐 Hướng dẫn Xác thực (Authentication):',
    '1. Bấm nút **Authorize** ở góc phải màn hình.',
    '2. Nhập JWT Access Token vào ô giá trị và bấm **Authorize**.',
    '',
    '### 📦 Định dạng Phản hồi Lỗi Chuẩn (Error Envelope):',
    'Tất cả các mã lỗi (400, 401, 403, 404, 409, 500) đều tuân theo chuẩn `ApiErrorResponseDto` hỗ trợ đa ngôn ngữ i18n.',
  ].join('\n');

  const description = options?.description ?? defaultDescription;

  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT Access Token để xác thực',
        in: 'header',
      },
      authName,
    );

  const appUrl = configService?.get<string>('APP_URL');
  if (appUrl) {
    builder.addServer(appUrl, 'Configured Gateway / App Server');
  }
  builder.addServer('/', 'Current Host / Local Server');

  const documentConfig = builder.build();

  const document = SwaggerModule.createDocument(app, documentConfig, {
    deepScanRoutes: true,
    extraModels: [ApiErrorResponseDto, ValidationErrorDetailDto],
  });

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: `${title} | Swagger UI`,
    jsonDocumentUrl: `${path}-json`,
    yamlDocumentUrl: `${path}-yaml`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      docExpansion: 'none',
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 28px; }
    `,
  };

  SwaggerModule.setup(path, app, document, customOptions);

  logger.log(
    `📚 Swagger UI initialized at: /${path} (JSON: /${path}-json, YAML: /${path}-yaml)`,
  );
}
