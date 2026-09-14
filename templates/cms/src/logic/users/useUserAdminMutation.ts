import type { ApiResponse } from '@/shared/lib/http/types';
import dayjs from '@/shared/utils/dayjs.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userManagementApi } from '@/features/users/services/user-management.service';
import type {
  ChangeRoleRequest,
  CreateUserRequest,
  DeleteUserRequest,
  PublicProfile,
  UpdateUserByAdminRequest,
} from '@/features/users/services/user-management.types';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

const DASHBOARD_OVERVIEW_QUERY_KEY = ['dashboard', 'overview'] as const;

function invalidateDashboardOverview(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: DASHBOARD_OVERVIEW_QUERY_KEY });
}

function patchUserInList(queryClient: ReturnType<typeof useQueryClient>, id: string, patch: Partial<PublicProfile>) {
  queryClient.setQueriesData<ApiResponse<PublicProfile[]>>(
    { queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, 'list'], exact: false },
    old => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map(u => (String(u.id) === String(id) ? { ...u, ...patch } : u)),
      };
    },
  );
}

function patchUserDetail(queryClient: ReturnType<typeof useQueryClient>, id: string, patch: Partial<PublicProfile>) {
  queryClient.setQueryData(USER_MANAGEMENT_QUERY_KEYS.detail(id), (old: ApiResponse<PublicProfile> | undefined) => {
    if (!old?.data) return old;
    return { ...old, data: { ...old.data, ...patch } };
  });
}

export const useUserAdminMutation = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const res = await userManagementApi.createUser(data);
      if (res.error) {
        throw new Error(res.error.message || 'USER_CREATE_FAILED');
      }
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, 'list'],
        exact: false,
      });
      invalidateDashboardOverview(queryClient);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserByAdminRequest }) => {
      const res = await userManagementApi.updateUser(id, data);
      if (res.error) {
        throw new Error(res.error.message || 'USER_UPDATE_FAILED');
      }
      return res.data!;
    },
    onSuccess: (updated: PublicProfile, { id }) => {
      patchUserInList(queryClient, id, updated);
      patchUserDetail(queryClient, id, updated);
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ChangeRoleRequest }) => {
      const res = await userManagementApi.changeRole(id, data);
      if (res.error) {
        throw new Error(res.error.message || 'ROLE_CHANGE_FAILED');
      }
      return res.data!;
    },
    onSuccess: (updated: PublicProfile, { id }) => {
      patchUserDetail(queryClient, id, { role: updated.role });
      patchUserInList(queryClient, id, { role: updated.role });
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, 'list'],
        exact: false,
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: DeleteUserRequest }) => {
      const res = await userManagementApi.deleteUser(id, data as DeleteUserRequest);
      if (res.error) {
        throw new Error(res.error.message || 'USER_DELETE_FAILED');
      }
      return res.data!;
    },
    onSuccess: (_, { id }) => {
      const patch: Partial<PublicProfile> = { deletedAt: dayjs().toISOString() };
      patchUserInList(queryClient, id, patch);
      patchUserDetail(queryClient, id, patch);
      invalidateDashboardOverview(queryClient);
    },
  });

  const restoreUser = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await userManagementApi.restoreUser(id);
      if (res.error) {
        throw new Error(res.error.message || 'USER_RESTORE_FAILED');
      }
      return res.data!;
    },
    onSuccess: (_, { id }) => {
      const patch: Partial<PublicProfile> = { deletedAt: null, deletedReason: null };
      patchUserInList(queryClient, id, patch);
      patchUserDetail(queryClient, id, patch);
      invalidateDashboardOverview(queryClient);
    },
  });

  const revokeUserSession = useMutation({
    mutationFn: async ({ userId, jti }: { userId: string; jti: string }) => {
      const res = await userManagementApi.revokeUserSession(userId, jti);
      if (res.error) {
        throw new Error(res.error.message || 'SESSION_REVOKE_FAILED');
      }
      return res.data!;
    },
    onSuccess: () => {},
  });

  const forceLogout = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await userManagementApi.forceLogout(userId);
      if (res.error) {
        throw new Error(res.error.message || 'FORCE_LOGOUT_FAILED');
      }
      return res.data!;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_QUERY_KEYS.sessions(userId) });
    },
  });

  return { createUser, updateUser, changeRole, deleteUser, restoreUser, revokeUserSession, forceLogout };
};
