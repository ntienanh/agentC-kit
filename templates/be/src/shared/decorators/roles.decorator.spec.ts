import { Roles, ROLES_KEY } from './roles.decorator';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { UserRole } from '../enums';

describe('Roles Decorator', () => {
  it('should set ROLES_KEY metadata with provided roles', () => {
    class TestClass {}
    Roles(UserRole.ADMIN, UserRole.USER)(TestClass);
    const metadata = Reflect.getMetadata(ROLES_KEY, TestClass);
    expect(metadata).toEqual([UserRole.ADMIN, UserRole.USER]);
  });
});

describe('Public Decorator', () => {
  it('should set IS_PUBLIC_KEY metadata to true', () => {
    class TestRoute {}
    Public()(TestRoute);
    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestRoute);
    expect(metadata).toBe(true);
  });
});
