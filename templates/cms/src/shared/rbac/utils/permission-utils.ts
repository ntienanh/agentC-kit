import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS } from '../permission-key';

export type PermissionSubject = (typeof PERMISSION_SUBJECTS)[keyof typeof PERMISSION_SUBJECTS];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];
export type PermissionKey = `${string}:${string}`;

export function permissionKey(subject: string, action: string): PermissionKey {
  return `${subject}:${action}`;
}

export function permissionKeys(subject: string, actions: readonly string[]): PermissionKey[] {
  return actions.map(action => permissionKey(subject, action));
}
