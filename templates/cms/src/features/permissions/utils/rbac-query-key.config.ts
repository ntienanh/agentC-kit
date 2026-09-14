import type { PermissionListParams } from '../types';

export const RBAC_QUERY_KEYS = {
  permissions: (params?: PermissionListParams) => ['permissions', params] as const,
  permission: (id: string) => ['permissions', id] as const,
  actions: () => ['permissions', 'actions'] as const,
};
