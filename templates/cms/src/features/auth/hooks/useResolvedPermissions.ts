'use client';

import type { Permission } from '@/shared/rbac';
import { parsePermissions } from '@/shared/rbac';
import { useMemo } from 'react';

interface UseResolvedPermissionsParams {
  readonly rolePermissions?: string[];
  readonly fallbackPermissions?: Permission[];
  readonly allowFallbackPermissions?: boolean;
}

export function useResolvedPermissions({
  rolePermissions,
  fallbackPermissions,
  allowFallbackPermissions = true,
}: Readonly<UseResolvedPermissionsParams>) {
  return useMemo(() => {
    if (rolePermissions && rolePermissions.length > 0) {
      return parsePermissions(rolePermissions);
    }

    if (allowFallbackPermissions && fallbackPermissions && fallbackPermissions.length > 0) {
      return fallbackPermissions;
    }

    return [];
  }, [allowFallbackPermissions, rolePermissions, fallbackPermissions]);
}
