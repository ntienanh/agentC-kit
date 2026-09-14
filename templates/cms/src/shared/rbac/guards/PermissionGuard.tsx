'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { PermissionInput } from '../utils';

interface PermissionGuardProps {
  required: readonly PermissionInput[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ required, requireAll = true, fallback = null, children }: PermissionGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = requireAll ? hasAllPermissions(required) : hasAnyPermission(required);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
