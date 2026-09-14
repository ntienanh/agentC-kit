import { STALE_TIME } from '@/shared/lib/config';
import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS, permissionKey, useProtectedQuery } from '@/shared/rbac';
import { userManagementApi } from '@/features/users/services/user-management.service';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export const useUserStoreAssignmentsQuery = (id: string | undefined) => {
  const { data, ...rest } = useProtectedQuery({
    permissions: [permissionKey(PERMISSION_SUBJECTS.USERS, PERMISSION_ACTIONS.READ)],
    queryOptions: {
      queryKey: USER_MANAGEMENT_QUERY_KEYS.storeAssignments(id ?? ''),
      queryFn: ({ signal }) => userManagementApi.listStoreAssignments(id!, signal),
      staleTime: STALE_TIME.SLOW,
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  return {
    assignments: data?.data ?? [],
    ...rest,
  };
};
