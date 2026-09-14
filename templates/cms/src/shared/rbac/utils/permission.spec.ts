import { describe, expect, it, vi } from 'vitest';
import {
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
import { permissionKey, permissionKeys } from './permission-utils';

describe('permission-utils & permission-core', () => {
  it('creates permission keys correctly', () => {
    expect(permissionKey('users', 'read')).toBe(['users', 'read'].join(':'));
    expect(permissionKeys('users', ['read', 'write'])).toEqual([
      ['users', 'read'].join(':'),
      ['users', 'write'].join(':'),
    ]);
  });

  it('resolves role names and checks privileged roles', () => {
    expect(resolveRoleName({ name: 'ADMIN' })).toBe('ADMIN');
    expect(resolveRoleName({ type: 'SUPER_ADMIN' })).toBe('SUPER_ADMIN');
    expect(resolveRoleName(null)).toBe('');

    expect(isPrivilegedRole({ name: 'ADMIN' })).toBe(true);
    expect(isPrivilegedRole({ name: 'USER' })).toBe(false);
  });

  it('checks permissions via hasPermissionKey, hasAllPermissionKeys, hasAnyPermissionKey', () => {
    const userPermissions = [permissionKey('users', 'read'), 'orders:manage'];

    expect(hasPermissionKey(userPermissions, permissionKey('users', 'read'))).toBe(true);
    expect(hasPermissionKey(userPermissions, 'orders:read')).toBe(true);
    expect(hasPermissionKey(userPermissions, 'settings:read')).toBe(false);
    expect(hasPermissionKey(userPermissions, 'settings:read', { name: 'ADMIN' })).toBe(true);

    expect(hasAllPermissionKeys(userPermissions, [permissionKey('users', 'read'), 'orders:manage'])).toBe(true);
    expect(hasAllPermissionKeys(userPermissions, [permissionKey('users', 'read'), 'settings:read'])).toBe(false);

    expect(hasAnyPermissionKey(userPermissions, ['settings:read', permissionKey('users', 'read')])).toBe(true);
    expect(hasAnyPermissionKey(userPermissions, ['settings:read', 'reports:read'])).toBe(false);
  });

  it('checks structured permissions and parses permission strings', () => {
    const structured = [
      { subject: 'users', action: 'read', fields: ['name', 'email'] },
      { subject: 'orders', action: 'manage' },
    ];

    expect(hasStructuredPermission(structured, 'read', 'users')).toBe(true);
    expect(hasStructuredPermission(structured, 'write', 'orders')).toBe(true);
    expect(getAllowedFields(structured, 'read', 'users')).toEqual(['name', 'email']);
    expect(getAllowedFields(structured, 'read', 'orders')).toBeNull();

    const uRead = permissionKey('users', 'read');
    expect(parsePermission(uRead)).toEqual({ resource: 'users', action: 'read' });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parsePermission('invalid-format')).toBeNull();
    warnSpy.mockRestore();

    const parsedList = parsePermissions([permissionKey('users', 'read'), 'invalid', 'orders:write']);
    expect(parsedList.length).toBe(2);
    expect(parsedList[0].subject).toBe('users');
  });
});
