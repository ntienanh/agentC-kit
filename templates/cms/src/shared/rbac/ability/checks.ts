import { getAllowedFields as getStructuredAllowedFields, hasStructuredPermission } from '../utils';
import type { Permission } from './types';

export function hasPermission(permissions: Permission[], action: string, subject: string): boolean {
  return hasStructuredPermission(permissions, action, subject);
}

export function getAllowedFields(permissions: Permission[], action: string, subject: string): string[] | null {
  return getStructuredAllowedFields(permissions, action, subject);
}
