'use client';

import type { PermissionInput } from '../utils';
import { usePermissions } from './usePermissions';

export function useStringPermission() {
  const { permissions, hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  const can = (permission: PermissionInput): boolean => hasPermission(permission);

  const canAny = (required: readonly PermissionInput[]): boolean => hasAnyPermission(required);

  const canAll = (required: readonly PermissionInput[]): boolean => hasAllPermissions(required);

  return { can, canAny, canAll, permissions };
}
