'use client';

import { PERMISSION_ACTIONS } from '../permission-key';
import { permissionKey } from '../utils';
import { usePermissions } from './usePermissions';

export function useCrudPermissions(subject: string) {
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(permissionKey(subject, PERMISSION_ACTIONS.CREATE));
  const canRead = hasPermission(permissionKey(subject, PERMISSION_ACTIONS.READ));
  const canUpdate = hasPermission(permissionKey(subject, PERMISSION_ACTIONS.UPDATE));
  const canDelete = hasPermission(permissionKey(subject, PERMISSION_ACTIONS.DELETE));
  const canRestore = hasPermission(permissionKey(subject, PERMISSION_ACTIONS.RESTORE));

  const can = (action: string) => hasPermission(permissionKey(subject, action));

  return {
    can,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canRestore,
  };
}
