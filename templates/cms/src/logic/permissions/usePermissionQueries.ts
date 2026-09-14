import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { permissionApi } from '@/features/permissions/services/permission.service';
import type { PermissionListParams } from '@/features/permissions/types';
import { RBAC_QUERY_KEYS } from '@/features/permissions/utils/rbac-query-key.config';

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  resource?: { eq?: string } | string;
  [key: string]: unknown;
}

function toPermissionListParams(params?: PermissionQueryParams): PermissionListParams | undefined {
  if (!params) return undefined;

  const { page, limit, search, resource } = params;
  const resourceValue = typeof resource === 'object' ? resource?.eq : resource;

  return {
    page,
    limit,
    search,
    resource: resourceValue,
  };
}

function cleanPermissionListParams(params?: PermissionListParams): PermissionListParams | undefined {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as PermissionListParams;
}

export const usePermissions = (params?: PermissionQueryParams) => {
  const apiParams = cleanPermissionListParams(toPermissionListParams(params));
  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.PERMISSIONS, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: RBAC_QUERY_KEYS.permissions(apiParams),
      queryFn: ({ signal }) => permissionApi.listPermissions(apiParams, signal),
      staleTime: STALE_TIME.SLOW,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  });

  return {
    permissions: data?.data ?? {},
    ...rest,
  };
};

export const usePermission = (id: string) => {
  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.PERMISSIONS, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: RBAC_QUERY_KEYS.permission(id),
      queryFn: ({ signal }) => permissionApi.getPermissionById(id, signal),
      staleTime: STALE_TIME.SLOW,
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  });

  return {
    permission: data?.data ?? null,
    ...rest,
  };
};
