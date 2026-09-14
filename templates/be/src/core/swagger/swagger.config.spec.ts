import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './swagger.config';

describe('setupSwagger', () => {
  let mockApp: Partial<INestApplication>;
  let mockConfigService: { get: jest.Mock };
  let createDocumentSpy: jest.SpyInstance;
  let setupSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    };

    mockApp = {
      get: jest.fn().mockImplementation((token: unknown) => {
        if (token === ConfigService) {
          return mockConfigService;
        }
        return null;
      }),
    };

    createDocumentSpy = jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {},
      });
    setupSpy = jest.spyOn(SwaggerModule, 'setup').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not initialize Swagger if enabled is explicitly set to false', () => {
    setupSwagger(mockApp as INestApplication, { enabled: false });

    expect(createDocumentSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it('should initialize Swagger with default options when enabled is true', () => {
    setupSwagger(mockApp as INestApplication, { enabled: true });

    expect(createDocumentSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith(
      'docs',
      mockApp,
      expect.anything(),
      expect.anything(),
    );
  });

  it('should initialize Swagger with custom options and environment variables including APP_URL', () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'SWAGGER_ENABLED') return true;
      if (key === 'SWAGGER_PATH') return 'api-docs';
      if (key === 'SWAGGER_TITLE') return 'Custom Nest App';
      if (key === 'SWAGGER_VERSION') return '2.0.0';
      if (key === 'APP_URL') return 'https://api.example.com';
      return undefined;
    });

    setupSwagger(mockApp as INestApplication, {
      title: 'Custom Title',
      path: 'custom-path',
      version: '3.0.0',
      description: 'Custom Description',
      bearerAuthName: 'custom-auth',
    });

    expect(createDocumentSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith(
      'custom-path',
      mockApp,
      expect.anything(),
      expect.anything(),
    );
  });

  it('should handle missing ConfigService gracefully', () => {
    mockApp.get = jest.fn().mockReturnValue(null);

    setupSwagger(mockApp as INestApplication, { enabled: true });

    expect(createDocumentSpy).toHaveBeenCalled();
  });

  it('should fallback to NODE_ENV check when options is undefined', () => {
    mockApp.get = jest.fn().mockReturnValue(null);
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    setupSwagger(mockApp as INestApplication);

    expect(createDocumentSpy).toHaveBeenCalled();
    process.env.NODE_ENV = prevEnv;
  });
});
