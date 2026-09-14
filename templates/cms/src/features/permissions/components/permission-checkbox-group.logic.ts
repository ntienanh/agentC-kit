import type { PermissionItem, PermissionsGrouped } from '../types';

const HIDDEN_ACTIONS = new Set(['manage', 'write']);

function visiblePermissions(permissions: PermissionsGrouped): PermissionItem[] {
  return Object.values(permissions)
    .flat()
    .filter(permission => !HIDDEN_ACTIONS.has(permission.action));
}

export function getVisibleActions(permissions: PermissionsGrouped): string[] {
  return Array.from(new Set(visiblePermissions(permissions).map(permission => permission.action)));
}

export function getVisiblePermissionIds(permissions: PermissionsGrouped): string[] {
  return visiblePermissions(permissions).map(permission => permission.id);
}

export function getVisibleRowPermissionIds(permissions: PermissionsGrouped, resource: string): string[] {
  return (permissions[resource] ?? [])
    .filter(permission => !HIDDEN_ACTIONS.has(permission.action))
    .map(permission => permission.id);
}

export function getVisibleColumnPermissionIds(permissions: PermissionsGrouped, action: string): string[] {
  return visiblePermissions(permissions)
    .filter(permission => permission.action === action)
    .map(permission => permission.id);
}

export function getRowCheckState(permissions: PermissionsGrouped, resource: string, value: string[]) {
  const ids = getVisibleRowPermissionIds(permissions, resource);
  const checkedCount = ids.filter(id => value.includes(id)).length;

  return {
    checked: ids.length > 0 && checkedCount === ids.length,
    indeterminate: checkedCount > 0 && checkedCount < ids.length,
  };
}

export function applyPermissionToggle(
  permissions: PermissionsGrouped,
  value: string[],
  resource: string,
  action: string,
  id: string,
  checked: boolean,
): string[] {
  const nextSet = new Set(value);

  if (checked) nextSet.add(id);
  else nextSet.delete(id);

  const readId = permissions[resource]?.find(permission => permission.action === 'read')?.id;
  const dependentIds = getVisibleRowPermissionIds(permissions, resource).filter(dependentId => dependentId !== readId);

  if (checked && action !== 'read' && readId) {
    nextSet.add(readId);
  }

  if (!checked && action === 'read') {
    dependentIds.forEach(dependentId => nextSet.delete(dependentId));
  }

  return [...nextSet];
}

export function applyColumnToggle(
  permissions: PermissionsGrouped,
  value: string[],
  action: string,
  checked: boolean,
): string[] {
  const ids = getVisibleColumnPermissionIds(permissions, action);
  const nextSet = new Set(checked ? [...value, ...ids] : value.filter(v => !ids.includes(v)));

  if (action !== 'read' && checked) {
    getVisibleColumnPermissionIds(permissions, 'read').forEach(id => nextSet.add(id));
  }

  if (action === 'read' && !checked) {
    visiblePermissions(permissions)
      .filter(permission => permission.action !== 'read')
      .forEach(permission => nextSet.delete(permission.id));
  }

  return [...nextSet];
}

export function applyToggleAll(permissions: PermissionsGrouped, value: string[], checked: boolean): string[] {
  const allIds = getVisiblePermissionIds(permissions);
  return checked ? [...new Set([...value, ...allIds])] : value.filter(v => !allIds.includes(v));
}
