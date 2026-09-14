'use client';

import { useUserStore } from '@/shared/stores/user.store';
import {
  hasAllPermissionKeys,
  hasAnyPermissionKey,
  hasPermissionKey,
  isPrivilegedRole,
  type PermissionInput,
  type PermissionRole,
} from '../utils';

export function usePermissions() {
  const user = useUserStore(state => state.user);
  const role = user?.role;
  const roleObj: PermissionRole | null | undefined = role
    ? {
        name: String(role),
      }
    : null;
  const permissions: string[] = user?.permissions?.length
    ? user.permissions
    : [];
  const isAdmin = isPrivilegedRole(roleObj);

  const hasPermission = (permission: PermissionInput): boolean => hasPermissionKey(permissions, permission, roleObj);

  const hasAllPermissions = (required: readonly PermissionInput[]): boolean =>
    hasAllPermissionKeys(permissions, required, roleObj);

  const hasAnyPermission = (required: readonly PermissionInput[]): boolean =>
    hasAnyPermissionKey(permissions, required, roleObj);

  return { permissions, isAdmin, hasPermission, hasAllPermissions, hasAnyPermission };
}
