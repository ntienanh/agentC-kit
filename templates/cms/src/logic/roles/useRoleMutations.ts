import type { ApiResponse } from '@/shared/lib/http/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RoleDetailData, RoleListItem, RoleObject } from '@/features/roles/models';
import { roleApi } from '@/features/roles/services/role.service';
import type {
  AssignPermissionsRequest,
  CreateRoleRequest,
  RemovePermissionsRequest,
  UpdateRoleRequest,
} from '@/features/roles/services/role.types';
import { ROLE_QUERY_KEYS } from '@/features/roles/utils';

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.roles() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => roleApi.updateRole(id, data),
    onSuccess: (response: ApiResponse<RoleObject>, { id }) => {
      const updated = response.data;
      if (!updated) return;

      queryClient.setQueriesData<ApiResponse<RoleListItem[]>>({ queryKey: ROLE_QUERY_KEYS.roles(), exact: false }, old => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(role =>
            role.id === updated.id ? { ...role, name: updated.name, description: updated.description } : role,
          ),
        };
      });

      queryClient.setQueryData(ROLE_QUERY_KEYS.role(id), (old: ApiResponse<RoleDetailData> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, name: updated.name, description: updated.description },
        };
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.roles() });
    },
  });
};

export const useAssignPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionsRequest }) => roleApi.assignPermissions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.role(id) });
    },
  });
};

export const useRemovePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RemovePermissionsRequest }) => roleApi.removePermissions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.role(id) });
    },
  });
};
