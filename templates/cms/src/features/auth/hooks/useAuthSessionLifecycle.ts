const apiFetch = fetch;
'use client';

import { APP_CONFIG } from '@/configs/app/app.config';
import { AUTH_PAGES } from '@/configs/app/auth/auth-flow.config';
import { SESSION_STORAGE_KEYS, SESSION_TIMING } from '@/configs/core/session.config';
import { usePathname, useRouter } from '@/shared/i18n';
import type { UserInfo } from '@/shared/stores';
import { useUserStore } from '@/shared/stores';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTH_INTERNAL_ENDPOINTS } from '../services/auth.endpoints';
import { AUTH_EVENT_TYPES, AUTH_SIGNOUT_REASONS, logAuthEvent } from '../utils/auth-event';
import { createRefreshSingleFlight, type SessionDataLike } from '../utils/auth-refresh-singleflight';
import { normalizeAuthUser } from '../utils/auth-user.mapper';

interface SessionData {
  accessToken: string;
  expiresIn: number;
}
type SessionPayload = SessionDataLike;

interface UseAuthSessionLifecycleParams {
  readonly clearAuth: () => void;
  readonly setUser: (user: UserInfo, expiresIn?: number) => void;
  readonly updateTokenExpiry: (expiresIn: number) => void;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isAuthRefreshDebugEnabled() {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  try {
    return globalThis.localStorage?.getItem(SESSION_STORAGE_KEYS.AUTH_REFRESH_DEBUG) === '1';
  } catch {
    return false;
  }
}

function logRefresh(message: string, ...args: unknown[]) {
  if (isAuthRefreshDebugEnabled()) {
    console.info(`[AuthRefresh] ${message}`, ...args);
  }
}

function normalizeExpiresIn(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= SESSION_TIMING.MIN_EXPIRES_IN_SEC
    ? value
    : SESSION_TIMING.DEFAULT_EXPIRES_IN_SEC;
}

function normalizeSessionData(payload: Partial<SessionData> | null | undefined): SessionData | null {
  if (typeof payload?.accessToken !== 'string' || payload.accessToken.length === 0) {
    return null;
  }

  return {
    accessToken: payload.accessToken,
    expiresIn: normalizeExpiresIn(payload.expiresIn),
  };
}

export function useAuthSessionLifecycle({
  clearAuth,
  setUser,
  updateTokenExpiry,
}: Readonly<UseAuthSessionLifecycleParams>) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);
  const isSigningOutRef = useRef(false);
  const refreshPromiseRef = useRef<(() => Promise<SessionData | null>) | null>(null);
  const requestEpochRef = useRef(0);

  const clearAuthRef = useRef(clearAuth);
  const setUserRef = useRef(setUser);
  const updateTokenExpiryRef = useRef(updateTokenExpiry);
  clearAuthRef.current = clearAuth;
  setUserRef.current = setUser;
  updateTokenExpiryRef.current = updateTokenExpiry;

  const isAuthPage = AUTH_PAGES.has(pathname as Parameters<typeof AUTH_PAGES.has>[0]);

  const redirectToSignin = useCallback(async () => {
    try {
      await apiFetch(AUTH_INTERNAL_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch {
      void 0;
    }
    router.push(APP_CONFIG.routing.defaultUnauthenticatedRoute);
  }, [router]);

  const forceSignout = useCallback(
    async (reason: string, extras?: { errorCode?: string; status?: number; context?: string }) => {
      if (isSigningOutRef.current) return;
      isSigningOutRef.current = true;

      logAuthEvent(AUTH_EVENT_TYPES.FORCED_SIGNOUT, {
        reason,
        errorCode: extras?.errorCode,
        status: extras?.status,
        context: extras?.context,
        route: globalThis.window?.location?.pathname,
      });
      clearAuthRef.current();
      await redirectToSignin();
    },
    [redirectToSignin],
  );

  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((refreshAtMs: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (!isAuthRefreshDebugEnabled()) return;

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((refreshAtMs - Date.now()) / SESSION_TIMING.ONE_SECOND_MS));

      if (remaining <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        return;
      }

      if (
        remaining <= SESSION_TIMING.COUNTDOWN_WARNING_THRESHOLD_SEC ||
        remaining % SESSION_TIMING.COUNTDOWN_LOG_INTERVAL_SEC === 0
      ) {
        logRefresh(`⏱️ Next refresh in ${remaining}s`);
      }
    }, SESSION_TIMING.ONE_SECOND_MS);
  }, []);

  const doRefresh = useCallback(async (): Promise<SessionData | null> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = createRefreshSingleFlight<SessionPayload | null>(async () => {
        if (isRefreshingRef.current) return null;

        isRefreshingRef.current = true;
        const currentEpoch = ++requestEpochRef.current;

        try {
          logRefresh('🔄 Refreshing tokens...');
          const res = await apiFetch(AUTH_INTERNAL_ENDPOINTS.REFRESH, { method: 'POST' });

          if (!res.ok) {
            logRefresh('❌ Refresh failed:', res.status);
            logAuthEvent(AUTH_EVENT_TYPES.REFRESH_FAILED, {
              reason: AUTH_SIGNOUT_REASONS.REFRESH_FAILED,
              status: res.status,
              context: 'refresh_not_ok',
              route: globalThis.window?.location?.pathname,
            });
            return null;
          }

          const json = (await res.json()) as Partial<SessionData>;
          const session = normalizeSessionData(json);

          if (!session) {
            logRefresh('❌ Refresh payload missing access token');
            logAuthEvent(AUTH_EVENT_TYPES.REFRESH_FAILED, {
              reason: AUTH_SIGNOUT_REASONS.REFRESH_FAILED,
              errorCode: 'INVALID_REFRESH_PAYLOAD',
              context: 'refresh_invalid_payload',
              route: globalThis.window?.location?.pathname,
            });
            return null;
          }

          if (currentEpoch !== requestEpochRef.current) {
            return null;
          }

          logRefresh('✅ Refresh success, new token expires in', session.expiresIn, 's');
          return session;
        } catch (error) {
          logRefresh('❌ Refresh error:', error);
          logAuthEvent(AUTH_EVENT_TYPES.REFRESH_FAILED, {
            reason: AUTH_SIGNOUT_REASONS.REFRESH_FAILED,
            errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            context: 'refresh_exception',
            route: globalThis.window?.location?.pathname,
          });
          return null;
        } finally {
          isRefreshingRef.current = false;
        }
      });
    }

    return refreshPromiseRef.current();
  }, []);

  const getSession = useCallback(async (signal?: AbortSignal): Promise<SessionData | null> => {
    try {
      const res = await apiFetch(AUTH_INTERNAL_ENDPOINTS.SESSION, { signal });
      if (!res.ok) return null;

      const json = (await res.json()) as Partial<SessionData>;
      const session = normalizeSessionData(json);

      if (session) {
        logRefresh('📋 Session check: access token expires in', session.expiresIn, 's');
      }

      return session;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      return null;
    }
  }, []);

  const scheduleRefreshRef = useRef<((expiresInSec: number) => void) | null>(null);

  scheduleRefreshRef.current = (expiresInSec: number) => {
    clearTimers();
    updateTokenExpiryRef.current(expiresInSec);

    const delayMs = Math.max(expiresInSec * SESSION_TIMING.ONE_SECOND_MS - SESSION_TIMING.REFRESH_BUFFER_MS, 0);
    const refreshAt = Date.now() + delayMs;

    logRefresh(
      `⏰ Token expires in ${expiresInSec}s → refresh in ${Math.round(delayMs / SESSION_TIMING.ONE_SECOND_MS)}s (buffer: ${SESSION_TIMING.REFRESH_BUFFER_MS / SESSION_TIMING.ONE_SECOND_MS}s)`,
    );

    startCountdown(refreshAt);

    refreshTimerRef.current = setTimeout(async () => {
      const result = await doRefresh();

      if (result) {
        scheduleRefreshRef.current?.(result.expiresIn);
        return;
      }

      void forceSignout(AUTH_SIGNOUT_REASONS.REFRESH_FAILED, { context: 'scheduled_refresh_failed' });
    }, delayMs);
  };

  useEffect(() => {
    const currentPath = globalThis.window?.location?.pathname ?? '';
    const isCurrentlyAuthPage =
      isAuthPage || Array.from(AUTH_PAGES).some(p => currentPath === p || currentPath.endsWith(p));

    if (isCurrentlyAuthPage) {
      setIsReady(true);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const init = async () => {
      try {
        const existingState = useUserStore.getState();
        if (
          existingState.user &&
          typeof existingState.tokenExpiry === 'number' &&
          existingState.tokenExpiry > Date.now()
        ) {
          const remainingSec = Math.round((existingState.tokenExpiry - Date.now()) / SESSION_TIMING.ONE_SECOND_MS);
          logRefresh(
            `🔥 Warm start — user already in store, token expires in ${remainingSec}s. Skipping session fetch.`,
          );
          scheduleRefreshRef.current?.(remainingSec);
          setIsReady(true);
          return;
        }

        const [session, profileResponse] = await Promise.all([
          getSession(controller.signal),
          apiFetch(AUTH_INTERNAL_ENDPOINTS.PROFILE, {
            signal: controller.signal,
            cache: 'no-store',
          }),
        ]);

        if (cancelled) return;

        if (!session) {
          setIsReady(true);
          await forceSignout(AUTH_SIGNOUT_REASONS.SESSION_MISSING, { context: 'initial_session_missing' });
          return;
        }

        scheduleRefreshRef.current?.(session.expiresIn);

        if (!profileResponse.ok) {
          setIsReady(true);
          await forceSignout(AUTH_SIGNOUT_REASONS.PROFILE_FETCH_FAILED, {
            context: 'initial_profile_not_ok',
            status: profileResponse.status,
          });
          return;
        }

        const json = (await profileResponse.json()) as { data?: UserInfo } & UserInfo;
        const raw = json.data ?? json;
        setUserRef.current(normalizeAuthUser(raw as unknown as Parameters<typeof normalizeAuthUser>[0]), session.expiresIn);
        setIsReady(true);
      } catch (error) {
        if (cancelled || isAbortError(error)) return;

        setIsReady(true);
        await forceSignout(AUTH_SIGNOUT_REASONS.PROFILE_FETCH_FAILED, { context: 'initial_lifecycle_exception' });
      }
    };

    init();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimers();
    };
  }, [clearTimers, forceSignout, getSession, isAuthPage]);

  return { isReady };
}
