import { clientFetcher } from '@/shared/lib/http';
import type {
  CreatePermissionRequest,
  PermissionItem,
  PermissionListParams,
  PermissionsGrouped,
  UpdatePermissionRequest,
} from '../types';
import { PERMISSION_ENDPOINTS } from './permissions.endpoints';

export const permissionApi = {
  listPermissions: (params?: PermissionListParams, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return clientFetcher<PermissionsGrouped>(
      `${PERMISSION_ENDPOINTS.LIST}${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
      {},
      signal,
    );
  },

  getPermissionById: (id: string, signal?: AbortSignal) =>
    clientFetcher<PermissionItem>(PERMISSION_ENDPOINTS.DETAIL(id), { method: 'GET' }, {}, signal),

  createPermission: (data: CreatePermissionRequest) =>
    clientFetcher<PermissionItem>(PERMISSION_ENDPOINTS.LIST, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePermission: (id: string, data: UpdatePermissionRequest) =>
    clientFetcher<PermissionItem>(PERMISSION_ENDPOINTS.DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePermission: (id: string) =>
    clientFetcher<{ message: string }>(PERMISSION_ENDPOINTS.DETAIL(id), {
      method: 'DELETE',
    }),
};
