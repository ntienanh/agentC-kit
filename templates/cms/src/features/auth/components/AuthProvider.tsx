'use client';

import { ACCESS_TOKEN, ID_TOKEN, REFRESH_TOKEN } from '@/configs/core/session.config';
import { cookieStorage } from '@/shared/lib/cookies.util';
import type { Permission } from '@/shared/rbac';
import { AbilityContext, AppAbility, defineAbility } from '@/shared/rbac';
import { useUserStore } from '@/shared/stores';
import { ReactNode, useCallback, useMemo } from 'react';
import { useAuthSessionLifecycle } from '../hooks/useAuthSessionLifecycle';
import { useResolvedPermissions } from '../hooks/useResolvedPermissions';

interface AuthProviderProps {
  readonly children: ReactNode;
  readonly fallbackPermissions?: Permission[];
}

export function AuthProvider({ children, fallbackPermissions }: AuthProviderProps) {
  const { setUser, clearUser, user } = useUserStore();
  const updateTokenExpiry = useUserStore(state => state.updateTokenExpiry);

  const clearAuth = useCallback(() => {
    clearUser();
    cookieStorage.remove(ACCESS_TOKEN);
    cookieStorage.remove(REFRESH_TOKEN);
    cookieStorage.remove(ID_TOKEN);
  }, [clearUser]);

  const { isReady } = useAuthSessionLifecycle({ clearAuth, setUser, updateTokenExpiry });

  const userPermissions = user?.permissions ?? [];
  const permissions = useResolvedPermissions({
    rolePermissions: userPermissions,
    fallbackPermissions,
    allowFallbackPermissions: isReady && userPermissions.length === 0,
  });

  const ability = useMemo<AppAbility>(() => defineAbility(permissions), [permissions]);

  if (!isReady) {
    return null;
  }

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
