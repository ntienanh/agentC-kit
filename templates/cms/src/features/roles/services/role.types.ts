import type { RoleDetailData, RoleListItem, RoleObject } from '../models';

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface RemovePermissionsRequest {
  permissionIds: string[];
}

export type ListRolesResponse = RoleListItem[];
export type GetRoleByIdResponse = RoleDetailData;
export type CreateRoleResponse = RoleObject;
export type UpdateRoleResponse = RoleObject;
export type DeleteRoleResponse = { message: string };
export type AssignPermissionsResponse = RoleObject;
export type RemovePermissionsResponse = RoleObject;
