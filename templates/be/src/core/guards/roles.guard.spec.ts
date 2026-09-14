import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@shared/enums';
import { ROLES_KEY } from '@shared/decorators';
import { IS_PUBLIC_KEY } from '@shared/decorators';

const createMockContext = (user?: { role?: UserRole }): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when route is @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return null;
    });
    expect(guard.canActivate(createMockContext())).toBe(true);
  });

  it('should allow access when no @Roles() is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(guard.canActivate(createMockContext({ role: UserRole.USER }))).toBe(
      true,
    );
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return null;
    });
    expect(guard.canActivate(createMockContext({ role: UserRole.ADMIN }))).toBe(
      true,
    );
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return null;
    });
    expect(guard.canActivate(createMockContext({ role: UserRole.USER }))).toBe(
      false,
    );
  });

  it('should deny access when user is not authenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMIN];
      return null;
    });
    expect(guard.canActivate(createMockContext(undefined))).toBe(false);
  });
});
