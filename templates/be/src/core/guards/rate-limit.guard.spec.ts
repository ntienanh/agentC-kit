import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';

const createMockContext = (
  ip: string = '127.0.0.1',
  path: string = '/api/v1/auth/login',
  method: string = 'POST',
) => {
  const headers: Record<string, string> = {};
  const responseHeaders: Record<string, string | number> = {};

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        headers,
        path,
        method,
      }),
      getResponse: () => ({
        setHeader: (key: string, value: string | number) => {
          responseHeaders[key] = value;
        },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
};

describe('RateLimitGuard Unit Tests', () => {
  let guard: RateLimitGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RateLimitGuard(reflector);
    guard.resetAll();
  });

  it('allows requests within limit and sets rate limit headers', () => {
    reflector.getAllAndOverride.mockReturnValue({ ttl: 60, limit: 3 });
    const ctx = createMockContext();

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks requests exceeding limit with 429 Too Many Requests', () => {
    reflector.getAllAndOverride.mockReturnValue({ ttl: 60, limit: 2 });
    const ctx = createMockContext();

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
    try {
      guard.canActivate(ctx);
    } catch (err) {
      const httpErr = err as HttpException;
      expect(httpErr.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('tracks distinct IP addresses independently', () => {
    reflector.getAllAndOverride.mockReturnValue({ ttl: 60, limit: 1 });
    const ctx1 = createMockContext('10.0.0.1');
    const ctx2 = createMockContext('10.0.0.2');

    expect(guard.canActivate(ctx1)).toBe(true);
    expect(guard.canActivate(ctx2)).toBe(true);

    expect(() => guard.canActivate(ctx1)).toThrow(HttpException);
    expect(() => guard.canActivate(ctx2)).toThrow(HttpException);
  });
});
