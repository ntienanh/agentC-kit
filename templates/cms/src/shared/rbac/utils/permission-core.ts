import type { PermissionKey } from './permission-utils';

export type PermissionInput = PermissionKey | string;

export interface PermissionRole {
  readonly name?: string | null;
  readonly type?: string | null;
}

export interface PermissionRecord {
  readonly id?: string;
  readonly name?: string;
  readonly subject: string;
  readonly action: string;
  readonly fields?: string[];
  readonly conditions?: unknown;
}

export interface ParsedPermission {
  readonly resource: string;
  readonly action: string;
}

const PRIVILEGED_ROLE_NAMES = new Set(['ADMIN', 'SUPER_ADMIN']);

export function resolveRoleName(role?: PermissionRole | null): string {
  return role?.name ?? role?.type ?? '';
}

export function isPrivilegedRole(role?: PermissionRole | null): boolean {
  return PRIVILEGED_ROLE_NAMES.has(resolveRoleName(role));
}

export function hasPermissionKey(
  permissions: readonly string[],
  permission: PermissionInput,
  role?: PermissionRole | null,
): boolean {
  if (isPrivilegedRole(role) || permissions.includes(permission)) return true;

  const parsedPermission = parsePermission(permission);
  if (!parsedPermission) return false;

  return permissions.includes(`${parsedPermission.resource}:manage`);
}

export function hasAllPermissionKeys(
  permissions: readonly string[],
  required: readonly PermissionInput[],
  role?: PermissionRole | null,
): boolean {
  return isPrivilegedRole(role) || required.every(permission => hasPermissionKey(permissions, permission, role));
}

export function hasAnyPermissionKey(
  permissions: readonly string[],
  required: readonly PermissionInput[],
  role?: PermissionRole | null,
): boolean {
  return isPrivilegedRole(role) || required.some(permission => hasPermissionKey(permissions, permission, role));
}

export function hasStructuredPermission(
  permissions: readonly PermissionRecord[],
  action: string,
  subject: string,
): boolean {
  return permissions.some(
    permission => (permission.action === action || permission.action === 'manage') && permission.subject === subject,
  );
}

export function getAllowedFields(
  permissions: readonly PermissionRecord[],
  action: string,
  subject: string,
): string[] | null {
  const permission = permissions.find(item => item.action === action && item.subject === subject);

  return permission?.fields ?? null;
}

export function parsePermission(permission: string): ParsedPermission | null {
  const parts = permission.split(':');
  if (parts.length !== 2) {
    console.warn(`Invalid permission format: ${permission}`);
    return null;
  }

  return { resource: parts[0], action: parts[1] };
}

export function parsePermissions<TPermission extends PermissionRecord = PermissionRecord>(
  permissions: readonly string[],
): TPermission[] {
  return permissions
    .map((permission, index) => {
      const parsed = parsePermission(permission);
      if (!parsed) return null;

      return {
        id: String(index),
        name: permission,
        subject: parsed.resource,
        action: parsed.action,
      } as TPermission;
    })
    .filter((permission): permission is TPermission => permission !== null);
}
