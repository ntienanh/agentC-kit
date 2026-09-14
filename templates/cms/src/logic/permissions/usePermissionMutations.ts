import type { ApiResponse } from '@/shared/lib/http/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '@/features/permissions/services/permission.service';
import type {
  CreatePermissionRequest,
  PermissionItem,
  PermissionsGrouped,
  UpdatePermissionRequest,
} from '@/features/permissions/types';
import { RBAC_QUERY_KEYS } from '@/features/permissions/utils/rbac-query-key.config';

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionRequest) => permissionApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RBAC_QUERY_KEYS.permissions() });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionRequest }) =>
      permissionApi.updatePermission(id, data),
    onSuccess: (response: ApiResponse<PermissionItem>, { id }) => {
      const updated = response.data;
      if (!updated) return;

      queryClient.setQueryData(RBAC_QUERY_KEYS.permission(id), (old: ApiResponse<PermissionItem> | undefined) =>
        old ? { ...old, data: updated } : old,
      );

      queryClient.setQueriesData<ApiResponse<PermissionsGrouped>>({ queryKey: RBAC_QUERY_KEYS.permissions(), exact: false }, old => {
        if (!old?.data) return old;
        const group = old.data[updated.resource];
        if (!group) return old;
        return {
          ...old,
          data: {
            ...old.data,
            [updated.resource]: group.map(p => (p.id === updated.id ? updated : p)),
          },
        };
      });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RBAC_QUERY_KEYS.permissions() });
    },
  });
};
