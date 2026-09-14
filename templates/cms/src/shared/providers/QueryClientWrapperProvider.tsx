'use client';

import { useI18n } from '@/shared/i18n';
import { API_CONFIG } from '@/shared/lib/config';
import { transformUnknownError } from '@/shared/lib/error/transformer';
import type { ApiError } from '@/shared/lib/http';
import { AUTH_EVENTS } from '@/shared/lib/http/client.fetcher';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useError } from './useError';

function shouldRetry(failureCount: number, error: unknown): boolean {
  const code = (error as ApiError)?.code;
  if (code === 401 || code === 403) return false;
  return failureCount < API_CONFIG.QUERY.RETRY;
}

const QUERY_ERROR_TOAST_DEDUP_MS = 2500;
let lastQueryErrorToastAt = 0;

function shouldShowQueryErrorToast() {
  const now = Date.now();
  if (now - lastQueryErrorToastAt < QUERY_ERROR_TOAST_DEDUP_MS) {
    return false;
  }
  lastQueryErrorToastAt = now;
  return true;
}

function getApiRequestFailedToastMessage(
  tCommon: (key: string, values?: Record<string, string | number>) => string,
  detail?: { status?: number; message?: string; code?: string | number },
): string | null {
  const code = String(detail?.code ?? '').toLowerCase();
  const rawMessage = String(detail?.message ?? '').trim();
  const messageText = rawMessage.toLowerCase();

  if (
    code === 'store_scope_required' ||
    code === 'store_access_denied' ||
    messageText.includes('x-store-id header is required')
  ) {
    return null;
  }

  if (code === 'insufficient_role' || code === 'insufficient_permissions') {
    return null;
  }

  if (code.startsWith('tenant_') || code === 'tenant_access_denied' || code === 'tenant_not_found') {
    return tCommon('apiFailTenant');
  }

  if (detail?.status === 401 || detail?.status === 403) {
    if (detail?.status === 401) return null;
    return tCommon('apiFailForbidden');
  }

  if (detail?.status === 408 || code.includes('timeout') || messageText.includes('timeout')) {
    return tCommon('apiFailTimeout');
  }

  if (detail?.status === 503 || code.includes('network') || messageText.includes('network')) {
    return tCommon('apiFailNetwork');
  }

  if (rawMessage && rawMessage !== 'UNKNOWN_ERROR' && rawMessage !== 'API_REQUEST_FAILED') {
    return tCommon('apiFailWithMessage', { message: rawMessage });
  }

  return tCommon('apiFailGeneric');
}

function createQueryClient(onError: (error: unknown) => void) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: () => {
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: API_CONFIG.QUERY.STALE_TIME,
        gcTime: API_CONFIG.QUERY.GC_TIME,
        retry: shouldRetry,
        retryDelay: API_CONFIG.QUERY.RETRY_DELAY,
        refetchOnWindowFocus: API_CONFIG.QUERY.REFRESH_ON_FOCUS,
        refetchOnReconnect: API_CONFIG.QUERY.REFRESH_ON_RECONNECT,
        refetchOnMount: API_CONFIG.QUERY.REFRESH_ON_MOUNT,
        networkMode: API_CONFIG.QUERY.NETWORK_MODE,
      },
      mutations: {
        retry: API_CONFIG.MUTATION.RETRY,
        networkMode: API_CONFIG.MUTATION.NETWORK_MODE,
        onError,
      },
    },
  });
}

export function QueryClientWrapperProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { message } = App.useApp();
  const { addError } = useError();
  const tCommon = useI18n('common');
  const onError = useCallback(
    (error: unknown) => {
      addError(
        transformUnknownError(error, {
          component: 'QueryClientWrapperProvider',
          action: 'mutation',
        }),
      );
    },
    [addError],
  );
  const [queryClient] = useState(() => createQueryClient(onError));

  useEffect(() => {
    const handleApiRequestFailed = (event: Event) => {
      if (!shouldShowQueryErrorToast()) return;

      const detail = (event as CustomEvent<{ status?: number; message?: string; code?: string | number }>).detail;
      const toastMessage = getApiRequestFailedToastMessage(tCommon, detail);
      if (!toastMessage) return;
      void message.warning(toastMessage);
    };

    window.addEventListener(AUTH_EVENTS.API_REQUEST_FAILED, handleApiRequestFailed);
    return () => window.removeEventListener(AUTH_EVENTS.API_REQUEST_FAILED, handleApiRequestFailed);
  }, [message, tCommon]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
