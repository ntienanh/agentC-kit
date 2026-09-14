import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenUtil } from '@shared/utils';
import { UserRole } from '@shared/enums';

const createMockContext = (
  headers: Record<string, string | undefined> = {},
) => {
  const req: { headers: Record<string, string | undefined>; user?: unknown } = {
    headers,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
};

describe('JwtAuthGuard Unit Tests', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;
  const secret = 'test-secret';

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    configService = {
      get: jest.fn().mockReturnValue(secret),
    } as unknown as jest.Mocked<ConfigService>;

    guard = new JwtAuthGuard(reflector, configService);
  });

  it('allows access to @Public() routes without token', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createMockContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws UnauthorizedException on protected route when token is missing', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = createMockContext();
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException on invalid token', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = createMockContext({
      authorization: 'Bearer invalid.token.value',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('attaches user to request and allows valid token', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const token = TokenUtil.sign(
      { sub: 'user-1', email: 'admin@example.com', role: UserRole.SUPER_ADMIN },
      secret,
    );
    const ctx = createMockContext({ authorization: `Bearer ${token}` });
    const result = guard.canActivate(ctx);
    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest<{ user: unknown }>();
    expect(req.user).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
    });
  });

  it('throws fatal error when JWT_SECRET is missing in config', () => {
    configService.get.mockReturnValue(undefined);
    const ctx = createMockContext();
    expect(() => guard.canActivate(ctx)).toThrow(/JWT_SECRET/);
  });
});
