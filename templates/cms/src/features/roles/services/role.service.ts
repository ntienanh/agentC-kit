import { clientFetcher } from '@/shared/lib/http';
import type {
  AssignPermissionsRequest,
  AssignPermissionsResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  DeleteRoleResponse,
  GetRoleByIdResponse,
  ListRolesResponse,
  RemovePermissionsRequest,
  RemovePermissionsResponse,
  RoleListParams,
  UpdateRoleRequest,
  UpdateRoleResponse,
} from './role.types';
import { ROLE_ENDPOINTS } from './roles.endpoints';

export const roleApi = {
  listRoles: (params?: RoleListParams, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return clientFetcher<ListRolesResponse>(
      `${ROLE_ENDPOINTS.LIST}${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
      {},
      signal,
    );
  },

  getRoleById: (id: string, signal?: AbortSignal) =>
    clientFetcher<GetRoleByIdResponse>(ROLE_ENDPOINTS.DETAIL(id), { method: 'GET' }, {}, signal),

  createRole: (data: CreateRoleRequest) =>
    clientFetcher<CreateRoleResponse>(ROLE_ENDPOINTS.LIST, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRole: (id: string, data: UpdateRoleRequest) =>
    clientFetcher<UpdateRoleResponse>(ROLE_ENDPOINTS.DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRole: (id: string) =>
    clientFetcher<DeleteRoleResponse>(ROLE_ENDPOINTS.DETAIL(id), {
      method: 'DELETE',
    }),

  assignPermissions: (id: string, data: AssignPermissionsRequest) =>
    clientFetcher<AssignPermissionsResponse>(ROLE_ENDPOINTS.PERMISSIONS(id), {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removePermissions: (id: string, data: RemovePermissionsRequest) =>
    clientFetcher<RemovePermissionsResponse>(ROLE_ENDPOINTS.PERMISSIONS(id), {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
};
