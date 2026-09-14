import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { useTenantStore } from '@/shared/stores';
import { userManagementApi } from '@/features/users/services/user-management.service';
import type { UserListParams } from '@/features/users/services/user-management.types';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export const useUserListQuery = (params?: UserListParams) => {
  const activeStoreId = useTenantStore(s => s.activeStoreId);

  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: USER_MANAGEMENT_QUERY_KEYS.list(params, activeStoreId),
      queryFn: ({ signal }) => userManagementApi.listUsers(params, signal),
      staleTime: STALE_TIME.SLOW,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  });

  return {
    users: data?.data ?? [],
    pagination: data?.pagination,
    ...rest,
  };
};
