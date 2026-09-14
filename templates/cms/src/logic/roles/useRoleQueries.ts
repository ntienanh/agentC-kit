import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { roleApi } from '@/features/roles/services/role.service';
import type { RoleListParams } from '@/features/roles/services/role.types';
import { ROLE_QUERY_KEYS } from '@/features/roles/utils';

export const useRoles = (params?: RoleListParams) => {
  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: ROLE_QUERY_KEYS.roles(params),
      queryFn: ({ signal }) => roleApi.listRoles(params, signal),
      staleTime: STALE_TIME.SLOW,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  });

  return {
    roles: data?.data ?? [],
    pagination: data?.pagination,
    ...rest,
  };
};

export const useRole = (id: string) => {
  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: ROLE_QUERY_KEYS.role(id),
      queryFn: ({ signal }) => roleApi.getRoleById(id, signal),
      staleTime: STALE_TIME.SLOW,
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  });

  return {
    role: data?.data ?? null,
    ...rest,
  };
};
