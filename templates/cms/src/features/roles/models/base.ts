export interface RolePermissionItem {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: string;
}

export interface RoleObject {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface RolePermissionEntry {
  roleId: string;
  permissionId: string;
  permission: RolePermissionItem;
}

export interface RoleDetailData {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermissionEntry[];
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}
