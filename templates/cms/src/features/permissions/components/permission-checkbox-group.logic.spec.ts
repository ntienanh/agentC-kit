import { PERMISSION_ACTIONS, PERMISSION_SUBJECTS } from '@/shared/rbac/permission-key';
import { permissionKey } from '@/shared/rbac/utils/permission-utils';
import { describe, expect, it } from 'vitest';
import type { PermissionsGrouped } from '../types';
import {
  applyColumnToggle,
  applyPermissionToggle,
  applyToggleAll,
  getRowCheckState,
  getVisibleActions,
  getVisibleColumnPermissionIds,
  getVisiblePermissionIds,
  getVisibleRowPermissionIds,
} from './permission-checkbox-group.logic';

const permissions: PermissionsGrouped = {
  [PERMISSION_SUBJECTS.ROLES]: [
    {
      id: 'r1',
      name: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.READ),
      resource: PERMISSION_SUBJECTS.ROLES,
      action: PERMISSION_ACTIONS.READ,
      description: null,
      createdAt: '',
    },
    {
      id: 'r2',
      name: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.CREATE),
      resource: PERMISSION_SUBJECTS.ROLES,
      action: PERMISSION_ACTIONS.CREATE,
      description: null,
      createdAt: '',
    },
    {
      id: 'r3',
      name: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.UPDATE),
      resource: PERMISSION_SUBJECTS.ROLES,
      action: PERMISSION_ACTIONS.UPDATE,
      description: null,
      createdAt: '',
    },
    {
      id: 'r4',
      name: permissionKey(PERMISSION_SUBJECTS.ROLES, PERMISSION_ACTIONS.MANAGE),
      resource: PERMISSION_SUBJECTS.ROLES,
      action: PERMISSION_ACTIONS.MANAGE,
      description: null,
      createdAt: '',
    },
    {
      id: 'r5',
      name: permissionKey(PERMISSION_SUBJECTS.ROLES, 'write'),
      resource: PERMISSION_SUBJECTS.ROLES,
      action: 'write',
      description: null,
      createdAt: '',
    },
  ],
};

describe('permission-checkbox-group.logic', () => {
  it('hides manage/write from visible ids', () => {
    expect(getVisibleActions(permissions)).toEqual(['read', 'create', 'update']);
    expect(getVisiblePermissionIds(permissions)).toEqual(['r1', 'r2', 'r3']);
    expect(getVisibleRowPermissionIds(permissions, 'roles')).toEqual(['r1', 'r2', 'r3']);
    expect(getVisibleColumnPermissionIds(permissions, 'manage')).toEqual([]);
  });

  it('row checkbox is checked when all visible ids are selected', () => {
    expect(getRowCheckState(permissions, 'roles', ['r1', 'r2', 'r3'])).toEqual({ checked: true, indeterminate: false });
  });

  it('row checkbox is indeterminate when some visible ids are selected', () => {
    expect(getRowCheckState(permissions, 'roles', ['r1'])).toEqual({ checked: false, indeterminate: true });
  });

  it('checking update auto-checks read', () => {
    expect(applyPermissionToggle(permissions, [], 'roles', 'update', 'r3', true).sort()).toEqual(['r1', 'r3']);
  });

  it('checking create auto-checks read', () => {
    expect(applyPermissionToggle(permissions, [], 'roles', 'create', 'r2', true).sort()).toEqual(['r1', 'r2']);
  });

  it('unchecking read removes dependent actions in same resource', () => {
    expect(applyPermissionToggle(permissions, ['r1', 'r2', 'r3'], 'roles', 'read', 'r1', false)).toEqual([]);
  });

  it('column toggle for create auto-checks read column too', () => {
    expect(applyColumnToggle(permissions, [], 'create', true).sort()).toEqual(['r1', 'r2']);
  });

  it('column toggle for read off removes dependent actions', () => {
    expect(applyColumnToggle(permissions, ['r1', 'r2', 'r3'], 'read', false)).toEqual([]);
  });

  it('toggle all ignores hidden actions', () => {
    expect(applyToggleAll(permissions, [], true).sort()).toEqual(['r1', 'r2', 'r3']);
  });
});
