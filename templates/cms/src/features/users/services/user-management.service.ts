import { clientFetcher } from '@/shared/lib/http';
import { USER_MANAGEMENT_ENDPOINTS } from './user-management.endpoints';
import type {
  ChangeRoleRequest,
  ChangeRoleResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  ForceLogoutResponse,
  GetSelfProfileResponse,
  GetSelfSessionsResponse,
  GetUserByIdResponse,
  ListUserStoreAssignmentsResponse,
  ListUsersResponse,
  RestoreUserResponse,
  RevokeSelfSessionResponse,
  RevokeUserSessionResponse,
  UpdateSelfProfileRequest,
  UpdateSelfProfileResponse,
  UpdateUserByAdminRequest,
  UpdateUserResponse,
  UserListParams,
} from './user-management.types';

export const userManagementApi = {
  listUsers: (params?: UserListParams, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    return clientFetcher<ListUsersResponse>(
      USER_MANAGEMENT_ENDPOINTS.LIST + (queryString ? '?' + queryString : ''),
      { method: 'GET' },
      {},
      signal,
    );
  },

  getUserById: (id: string, signal?: AbortSignal) =>
    clientFetcher<GetUserByIdResponse>(USER_MANAGEMENT_ENDPOINTS.DETAIL(id), { method: 'GET' }, {}, signal),

  listStoreAssignments: (id: string, signal?: AbortSignal) =>
    clientFetcher<ListUserStoreAssignmentsResponse>(
      USER_MANAGEMENT_ENDPOINTS.STORE_ASSIGNMENTS(id),
      { method: 'GET' },
      {},
      signal,
    ),

  createUser: (data: CreateUserRequest) =>
    clientFetcher<CreateUserResponse>(USER_MANAGEMENT_ENDPOINTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: UpdateUserByAdminRequest) =>
    clientFetcher<UpdateUserResponse>(USER_MANAGEMENT_ENDPOINTS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changeRole: (id: string, data: ChangeRoleRequest) =>
    clientFetcher<ChangeRoleResponse>(USER_MANAGEMENT_ENDPOINTS.CHANGE_ROLE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string, data: DeleteUserRequest) =>
    clientFetcher<DeleteUserResponse>(USER_MANAGEMENT_ENDPOINTS.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

  restoreUser: (id: string) =>
    clientFetcher<RestoreUserResponse>(USER_MANAGEMENT_ENDPOINTS.RESTORE(id), {
      method: 'POST',
    }),

  revokeUserSession: (userId: string, jti: string) =>
    clientFetcher<RevokeUserSessionResponse>(USER_MANAGEMENT_ENDPOINTS.REVOKE_USER_SESSION(userId, jti), {
      method: 'DELETE',
    }),

  forceLogout: (userId: string) =>
    clientFetcher<ForceLogoutResponse>(USER_MANAGEMENT_ENDPOINTS.FORCE_LOGOUT, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getSelfProfile: (signal?: AbortSignal) =>
    clientFetcher<GetSelfProfileResponse>(USER_MANAGEMENT_ENDPOINTS.SELF_PROFILE, { method: 'GET' }, {}, signal),

  getSelfSessions: (signal?: AbortSignal) =>
    clientFetcher<GetSelfSessionsResponse>(USER_MANAGEMENT_ENDPOINTS.SELF_SESSIONS, { method: 'GET' }, {}, signal),

  updateSelfProfile: (data: UpdateSelfProfileRequest) =>
    clientFetcher<UpdateSelfProfileResponse>(USER_MANAGEMENT_ENDPOINTS.SELF_UPDATE, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  revokeSelfSession: (jti: string) =>
    clientFetcher<RevokeSelfSessionResponse>(USER_MANAGEMENT_ENDPOINTS.REVOKE_SELF_SESSION(jti), {
      method: 'DELETE',
    }),
};
