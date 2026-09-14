'use client';

import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { useAppRouter } from '@/shared/hooks/navigation/useAppRouter';
import { useCallback, useEffect } from 'react';
import { useAbility } from '../ability';
import type { PermissionCheck } from './useCan';

export interface UsePageGuardOptions {
  permissions?: PermissionCheck[];
  requireAll?: boolean;
  redirectTo?: string;
}

export function usePageGuard(action: string, subject: string, options?: UsePageGuardOptions) {
  const ability = useAbility();
  const { replace } = useAppRouter();

  const checkPermissions = useCallback(() => {
    const { permissions, requireAll = false } = options || {};

    if (permissions && permissions.length > 0) {
      const results = permissions.map(permission => ability.can(permission.action, permission.subject));
      return requireAll ? results.every(Boolean) : results.some(Boolean);
    }

    return ability.can(action, subject);
  }, [ability, action, options, subject]);

  const isAuthorized = checkPermissions();

  useEffect(() => {
    if (!isAuthorized) {
      replace(options?.redirectTo || APP_HREFS.FORBIDDEN);
    }
  }, [isAuthorized, options?.redirectTo, replace]);

  return {
    isAuthorized,
    isLoading: false,
    checkPermissions,
  };
}

export function useMultiPageGuard(permissions: PermissionCheck[], options?: Omit<UsePageGuardOptions, 'permissions'>) {
  return usePageGuard('read', 'all', { ...options, permissions });
}
