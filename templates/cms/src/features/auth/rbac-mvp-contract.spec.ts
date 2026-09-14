import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { describe, expect, it, vi } from 'vitest';
import {
  MVP_AUTH_PROFILE_CMS_RECONCILIATION,
  MVP_RBAC_CMS_ROUTES,
  resolveMvpRbacGate,
  resolveMvpRbacRoutePermission,
} from './rbac-mvp-contract';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const rolesRead = ['roles', 'read'].join(':');
const permissionsRead = ['permissions', 'read'].join(':');
const usersRead = ['users', 'read'].join(':');

describe('MVP RBAC CMS contract', () => {
  it('keeps roles, permissions, and users mapped to explicit read permissions', () => {
    expect(MVP_RBAC_CMS_ROUTES).toEqual([
      { id: 'roles', href: APP_HREFS.ROLES, permission: rolesRead, owner: 'cms' },
      { id: 'permissions', href: APP_HREFS.PERMISSIONS, permission: permissionsRead, owner: 'cms' },
      { id: 'users', href: APP_HREFS.USERS, permission: usersRead, owner: 'cms' },
    ]);
  });

  it('resolves route permissions for admin guard wiring checks', () => {
    expect(resolveMvpRbacRoutePermission('/roles')?.permission).toBe(rolesRead);
    expect(resolveMvpRbacRoutePermission('/permissions')?.permission).toBe(permissionsRead);
    expect(resolveMvpRbacRoutePermission('/users')?.permission).toBe(usersRead);
    expect(resolveMvpRbacRoutePermission('/dashboard')).toBeUndefined();
  });

  it('defines allowed and denied outcomes for protected CMS route smoke gates', () => {
    expect(resolveMvpRbacGate('/roles', [])).toBe('forbidden');
    expect(resolveMvpRbacGate('/roles', [rolesRead])).toBe('allowed');
    expect(resolveMvpRbacGate('/permissions', [rolesRead])).toBe('forbidden');
    expect(resolveMvpRbacGate('/permissions', [permissionsRead])).toBe('allowed');
    expect(resolveMvpRbacGate('/dashboard', [])).toBe('public');
  });

  it('keeps FO auth/profile evidence anchored to CMS customer and operator review surfaces', () => {
    expect(MVP_AUTH_PROFILE_CMS_RECONCILIATION).toEqual({
      source: 'fo-auth-profile',
      customerLookupRoute: APP_HREFS.USERS,
      operatorLookupRoute: APP_HREFS.USERS,
      expectedFields: ['id', 'email', 'phone', 'displayName', 'role', 'status'],
      reviewSurfaces: [
        APP_HREFS.DASHBOARD,
        APP_HREFS.USERS,
        APP_HREFS.ROLES,
        APP_HREFS.PERMISSIONS,
      ],
    });
  });
});
