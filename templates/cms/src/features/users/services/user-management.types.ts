import type { ApiMessageResponse, AssignableAppRoleName } from '@/shared/models';
import type { PublicProfile, SessionInfo } from '../models';
export type { PublicProfile, SessionInfo } from '../models';

export interface UserListParams {
  role?: AssignableAppRoleName;
  search?: string;
  status?: 'active' | 'deleted';
  emailVerified?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  role?: AssignableAppRoleName;
  storeRole?: 'store_admin' | 'store_staff';
}

export interface UpdateUserByAdminRequest {
  displayName?: string;
  phone?: string;
  avatar?: string;
  role?: AssignableAppRoleName;
}

export interface UpdateSelfProfileRequest {
  displayName?: string;
  phone?: string;
  avatar?: string;
}

export interface DeleteUserRequest {
  reason: string;
}

export interface ForceLogoutRequest {
  userId: string;
}

export interface ChangeRoleRequest {
  role?: AssignableAppRoleName;
  roleId?: string;
}

export type ListUsersResponse = PublicProfile[];
export type GetUserByIdResponse = PublicProfile;
export type CreateUserResponse = PublicProfile;
export type UpdateUserResponse = PublicProfile;
export type ChangeRoleResponse = PublicProfile;
export type DeleteUserResponse = ApiMessageResponse;
export type RestoreUserResponse = ApiMessageResponse;
export type RevokeUserSessionResponse = ApiMessageResponse;
export type ForceLogoutResponse = ApiMessageResponse;
export type GetSelfProfileResponse = PublicProfile;
export type GetSelfSessionsResponse = SessionInfo[];
export type UpdateSelfProfileResponse = PublicProfile;
export type RevokeSelfSessionResponse = ApiMessageResponse;

export type UserTenantRole = 'tenant_admin' | 'tenant_staff' | 'store_admin' | 'store_staff' | string;
export type UserStoreRole = UserTenantRole;

export interface UserTenantAssignment {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug?: string | null;
  storeId?: string;
  storeName?: string | null;
  storeSlug?: string | null;
  role: UserTenantRole;
  isPrimary: boolean;
  assignedBy: number | null;
  createdAt: string;
}

export type UserStoreAssignment = UserTenantAssignment;
export type ListUserTenantAssignmentsResponse = UserTenantAssignment[];
export type ListUserStoreAssignmentsResponse = UserTenantAssignment[];
