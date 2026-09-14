export {
  getAllowedFields,
  hasAllPermissionKeys,
  hasAnyPermissionKey,
  hasPermissionKey,
  hasStructuredPermission,
  isPrivilegedRole,
  parsePermission,
  parsePermissions,
  resolveRoleName,
} from './permission-core';
export { permissionKey, permissionKeys } from './permission-utils';

export type { ParsedPermission, PermissionInput, PermissionRecord, PermissionRole } from './permission-core';
export type { PermissionAction, PermissionKey, PermissionSubject } from './permission-utils';
