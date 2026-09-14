import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS } from '@/shared/rbac/permission-key';
import { permissionKey } from '@/shared/rbac/utils/permission-utils';

export type MvpRbacCmsRoute = {
  readonly id: string;
  readonly href: string;
  readonly permission: `${string}:${string}`;
  readonly owner: 'cms';
};

export const MVP_RBAC_CMS_ROUTES = [
  {
    id: 'roles',
    href: APP_HREFS.ROLES,
    permission: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ),
    owner: 'cms',
  },
  {
    id: 'permissions',
    href: APP_HREFS.PERMISSIONS,
    permission: permissionKey(PERMISSION_SUBJECTS.PERMISSIONS, PERMISSION_ACTIONS.READ),
    owner: 'cms',
  },
  {
    id: 'users',
    href: APP_HREFS.USERS,
    permission: permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ),
    owner: 'cms',
  },
] as const satisfies readonly MvpRbacCmsRoute[];

export const MVP_AUTH_PROFILE_CMS_RECONCILIATION = {
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
} as const;

export function resolveMvpRbacRoutePermission(href: string): MvpRbacCmsRoute | undefined {
  return MVP_RBAC_CMS_ROUTES.find(route => route.href === href);
}

export function resolveMvpRbacGate(href: string, permissions: readonly string[]): 'allowed' | 'forbidden' | 'public' {
  const route = resolveMvpRbacRoutePermission(href);
  if (!route) return 'public';

  return permissions.includes(route.permission) ? 'allowed' : 'forbidden';
}
