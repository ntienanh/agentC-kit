export interface PermissionItem {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: string;
}

export type PermissionsGrouped = Record<string, PermissionItem[]>;

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminId: number;
  changes: Record<string, unknown>;
  createdAt: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  description?: string;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
}

export interface AuditLogParams {
  dateFrom?: string;
  dateTo?: string;
  adminId?: number;
  action?: string;
  page?: number;
  limit?: number;
}
