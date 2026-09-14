const useQueryHook = useQuery;
'use client';

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { PermissionInput } from '../utils';
import { usePermissions } from './usePermissions';

export function useProtectedQuery<TData = unknown, TError = Error>({
  permissions,
  requireAll = true,
  queryOptions,
}: {
  permissions: readonly PermissionInput[];
  requireAll?: boolean;
  queryOptions: UseQueryOptions<TData, TError>;
}): UseQueryResult<TData, TError> {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasPermission = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

  const enabled = hasPermission && queryOptions.enabled !== false;

  return useQueryHook({
    ...queryOptions,
    enabled,
  });
}
