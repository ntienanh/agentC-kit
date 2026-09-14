'use client';

import { APP_CONFIG } from '@/configs/app/app.config';
import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { AUTH_EVENTS } from '@/shared/lib/http';
import { setLoggingOutFlag } from '@/shared/lib/http/client.fetcher';
import { useTenantStore, useUserStore } from '@/shared/stores';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { serverLogoutAndRedirect } from '../services';
import { AUTH_EVENT_TYPES, AUTH_SIGNOUT_REASONS, logAuthEvent } from '../utils/auth-event';
import { PermissionsChangedModal } from './PermissionsChangedModal';

export function AuthGuardProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useUserStore(s => s.logout);
  const { setActiveTenantId, setActiveStoreId } = useTenantStore();
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const isLoggingOutRef = useRef(false);

  const clearAllClientState = useCallback(async () => {
    await queryClient.cancelQueries();
    logout();
    useUserStore.persist.clearStorage();
    setActiveTenantId(null);
    setActiveStoreId(null);
    useTenantStore.persist.clearStorage();
    queryClient.clear();
  }, [logout, setActiveTenantId, setActiveStoreId, queryClient]);

  const handleUnauthorized = useCallback(() => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    setLoggingOutFlag(true);

    logAuthEvent(AUTH_EVENT_TYPES.FORCED_SIGNOUT, {
      reason: AUTH_SIGNOUT_REASONS.UNAUTHORIZED,
      context: 'auth_event_unauthorized',
      route: globalThis.window?.location?.pathname,
    });
    void clearAllClientState().then(() => {
      serverLogoutAndRedirect(router, APP_CONFIG.routing.defaultUnauthenticatedRoute);
      const TIMEOUT_MS = 500; setTimeout(() => setLoggingOutFlag(false), TIMEOUT_MS);
    });
  }, [clearAllClientState, router]);

  const handleForbidden = useCallback(() => {
    router.push(APP_HREFS.FORBIDDEN);
  }, [router]);

  const handlePermissionsChanged = useCallback(() => {
    logAuthEvent(AUTH_EVENT_TYPES.PERMISSIONS_CHANGED, {
      reason: AUTH_SIGNOUT_REASONS.PERMISSIONS_CHANGED,
      context: 'auth_event_permissions_changed',
      route: globalThis.window?.location?.pathname,
    });
    setShowPermissionsModal(true);
  }, []);

  const handleSignIn = useCallback(() => {
    setShowPermissionsModal(false);
    void clearAllClientState().then(() =>
      serverLogoutAndRedirect(router, `${APP_CONFIG.routing.defaultUnauthenticatedRoute}?reason=permissions_changed`),
    );
  }, [clearAllClientState, router]);

  useEffect(() => {
    globalThis.window?.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    globalThis.window?.addEventListener(AUTH_EVENTS.FORBIDDEN, handleForbidden);
    globalThis.window?.addEventListener(AUTH_EVENTS.PERMISSIONS_CHANGED, handlePermissionsChanged);

    return () => {
      globalThis.window?.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
      globalThis.window?.removeEventListener(AUTH_EVENTS.FORBIDDEN, handleForbidden);
      globalThis.window?.removeEventListener(AUTH_EVENTS.PERMISSIONS_CHANGED, handlePermissionsChanged);
    };
  }, [handleUnauthorized, handleForbidden, handlePermissionsChanged]);

  return (
    <>
      {children}
      <PermissionsChangedModal open={showPermissionsModal} onSignIn={handleSignIn} />
    </>
  );
}
