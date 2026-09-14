import { StructuredLoggerService } from './structured-logger.service';
import { RequestContextService } from '../context/request-context.service';

describe('StructuredLoggerService', () => {
  let logger: StructuredLoggerService;
  let contextService: RequestContextService;

  beforeEach(() => {
    contextService = new RequestContextService();
    logger = new StructuredLoggerService(contextService);
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should log without throwing', () => {
    expect(() => logger.log('test message', 'TestContext')).not.toThrow();
  });

  it('should warn without throwing', () => {
    expect(() => logger.warn('warn message', 'TestContext')).not.toThrow();
  });

  it('should error without throwing', () => {
    expect(() =>
      logger.error('error message', new Error('boom'), 'TestContext'),
    ).not.toThrow();
  });

  it('should debug without throwing', () => {
    expect(() => logger.debug('debug message', 'TestContext')).not.toThrow();
  });

  it('should use "no-trace" when no context is active', () => {
    const writeSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    logger.log('hello', 'ctx');

    expect(writeSpy).toHaveBeenCalledWith(
      expect.stringContaining('"traceId":"no-trace"'),
    );

    process.env.NODE_ENV = originalEnv;
    writeSpy.mockRestore();
  });
});
