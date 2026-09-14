'use client';

import { useCallback } from 'react';
import { useAbility } from '../ability';

export interface PermissionCheck {
  action: string;
  subject: string;
}

export function useCan(action: string, subject: string) {
  const ability = useAbility();
  const hasPermission = ability.can(action, subject);

  const checkPermission = useCallback(
    (checkAction: string, checkSubject: string) => ability.can(checkAction, checkSubject),
    [ability],
  );

  return {
    hasPermission,
    checkPermission,
    ability,
  };
}

export function useMultiplePermissions(permissions: PermissionCheck[], requireAll = false) {
  const ability = useAbility();
  const results = permissions.map(({ action, subject }) => ability.can(action, subject));
  const hasPermissions = requireAll ? results.every(Boolean) : results.some(Boolean);
  const grantedPermissions = permissions.filter((_, index) => results[index]);

  return {
    hasPermissions,
    results: permissions.map((permission, index) => ({
      ...permission,
      granted: results[index],
    })),
    grantedPermissions,
  };
}
