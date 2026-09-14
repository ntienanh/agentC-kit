import type { Entity } from '@/shared/lib/types';
import type { ParsedPermission, PermissionAction } from '../utils';
import { parsePermission, parsePermissions as parsePermissionRecords } from '../utils';

export interface Permission extends Entity {
  subject: string;
  action: string;
  group?: string;
  name?: string;
  fields?: string[];
  conditions?: unknown;
}

export interface ActionNode {
  id: string;
  action: PermissionAction;
}

export interface FormattedPermission {
  id?: string;
  name?: string;
  subject: string;
  actions?: ActionNode[];
  items?: FormattedPermission[];
}

export type StringPermission = string;

export { parsePermission };
export type { ParsedPermission };

export function parsePermissions(permissions: string[]): Permission[] {
  return parsePermissionRecords<Permission>(permissions);
}
