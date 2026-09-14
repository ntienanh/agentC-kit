import { INTERNAL_PROXY_PREFIX } from './proxy.endpoints';
import { QueryBuilder } from './query.builder';
import { ResponseAdapter } from './response.adapter';
import type { ApiResponse, QueryParams } from './types';

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  FORBIDDEN: 'auth:forbidden',
  PERMISSIONS_CHANGED: 'auth:permissions_changed',
  API_REQUEST_FAILED: 'api:request_failed',
} as const;

let _isLoggingOut = false;

export function setLoggingOutFlag(value: boolean) {
  _isLoggingOut = value;
}

export function isLoggingOut() {
  return _isLoggingOut;
}

function sanitizePayloadObject(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayloadObject);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (!['id', 'createdAt', 'updatedAt', '__v', 'documentId'].includes(key)) {
      result[key] = sanitizePayloadObject(value);
    }
  }
  return result;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const ACTIVE_TENANT_STORAGE_KEY = 'active_tenant_id';

let _activeStoreIdGetter: (() => string | null) | null = null;
let _activeTenantIdGetter: (() => string | null) | null = null;

export function registerActiveStoreIdGetter(getter: () => string | null) {
  _activeStoreIdGetter = getter;
}

export function registerActiveTenantIdGetter(getter: () => string | null) {
  _activeTenantIdGetter = getter;
}

function resolveActiveStoreHeaderValue(): string | null {
  if (globalThis.window === undefined) return null;

  if (_activeStoreIdGetter) {
    return _activeStoreIdGetter();
  }

  const raw = globalThis.window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      state?: { activeStoreId?: string | null; activeTenantId?: string | null };
      activeStoreId?: string | null;
      activeTenantId?: string | null;
    };

    const activeStoreId = parsed?.state?.activeStoreId ?? parsed?.activeStoreId;
    return activeStoreId ?? null;
  } catch {
    return raw;
  }
}

function resolveActiveTenantHeaderValue(): string | null {
  if (globalThis.window === undefined) return null;

  if (_activeTenantIdGetter) {
    return _activeTenantIdGetter();
  }

  const raw = globalThis.window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      state?: { activeStoreId?: string | null; activeTenantId?: string | null };
      activeStoreId?: string | null;
      activeTenantId?: string | null;
    };

    const activeTenantId = parsed?.state?.activeTenantId ?? parsed?.activeTenantId;
    return activeTenantId ?? null;
  } catch {
    return null;
  }
}

function createTimeoutSignal(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  return controller.signal;
}

function isTimeoutAbortError(error: unknown, signal?: AbortSignal): boolean {
  return error instanceof DOMException && error.name === 'AbortError' && !signal?.aborted;
}

function dispatchApiRequestFailed(payload: { status: number; message: string; code?: string | number }) {
  if (globalThis.window === undefined) return;

  globalThis.window.dispatchEvent(new CustomEvent(AUTH_EVENTS.API_REQUEST_FAILED, { detail: payload }));
}

export async function clientFetcher<T>(
  endpoint: string,
  options: RequestInit = {},
  query: QueryParams = {},
  signal?: AbortSignal,
): Promise<ApiResponse<T>> {
  try {
    const queryString = typeof query === 'string' ? query : QueryBuilder.build(query);
    const suffix = queryString ? `?${queryString}` : '';
    const url = `${INTERNAL_PROXY_PREFIX}${endpoint}${suffix}`;

    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (globalThis.window !== undefined) {
      if (!headers['X-Store-ID'] && !headers['x-store-id']) {
        const activeStoreHeaderValue = resolveActiveStoreHeaderValue();
        if (activeStoreHeaderValue) {
          headers['X-Store-ID'] = activeStoreHeaderValue;
        }
      }
      if (!headers['X-Tenant-ID'] && !headers['x-tenant-id']) {
        const activeTenantHeaderValue = resolveActiveTenantHeaderValue();
        if (activeTenantHeaderValue) {
          headers['X-Tenant-ID'] = activeTenantHeaderValue;
        }
      }
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    let processedBody = options.body;
    if (!isFormData && typeof options.body === 'string' && options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
      try {
        const parsed = JSON.parse(options.body);
        processedBody = JSON.stringify(sanitizePayloadObject(parsed));
      } catch {
        void 0;
      }
    }

    const timeoutSignal = createTimeoutSignal(DEFAULT_TIMEOUT_MS, signal);

    const res = await fetch(url, {
      ...options,
      body: processedBody,
      headers,
      signal: timeoutSignal,
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    let json: Record<string, unknown> = {};
    try {
      json = await res.json();
    } catch {
      json = {};
    }

    if (res.status === 401 && globalThis.window !== undefined) {
      if (signal?.aborted || _isLoggingOut) return ResponseAdapter.error(json, res.status);

      const jsonRecord = (json && typeof json === 'object' ? (json as Record<string, unknown>) : undefined);
      const errorObj = (jsonRecord?.error && typeof jsonRecord.error === 'object' ? (jsonRecord.error as Record<string, unknown>) : undefined);
      const errorCode = String(errorObj?.code ?? jsonRecord?.code ?? '');
      if (errorCode === 'permissions_changed') {
        globalThis.window.dispatchEvent(new CustomEvent(AUTH_EVENTS.PERMISSIONS_CHANGED));
      } else {
        globalThis.window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      }
    }

    if (res.status === 403 && globalThis.window !== undefined) {
      if (_isLoggingOut) return ResponseAdapter.error(json, res.status);

      const jsonRecord = (json && typeof json === 'object' ? (json as Record<string, unknown>) : undefined);
      const errorObj = (jsonRecord?.error && typeof jsonRecord.error === 'object' ? (jsonRecord.error as Record<string, unknown>) : undefined);
      const errorCode = String(errorObj?.code ?? jsonRecord?.code ?? '');
      const suppressedCodes = ['store_access_denied', 'store_scope_required', 'insufficient_permissions'];
      if (!suppressedCodes.includes(errorCode)) {
        globalThis.window.dispatchEvent(new CustomEvent(AUTH_EVENTS.FORBIDDEN));
      }
    }

    if (!res.ok) {
      if (!_isLoggingOut) {
        const jsonRecord = (json && typeof json === 'object' ? (json as Record<string, unknown>) : undefined);
        const errorPayload = (jsonRecord?.error && typeof jsonRecord.error === 'object' ? (jsonRecord.error as Record<string, unknown>) : jsonRecord);
        dispatchApiRequestFailed({
          status: res.status,
          code: String(errorPayload?.code ?? errorPayload?.status ?? ''),
          message: String(errorPayload?.message ?? 'API_REQUEST_FAILED'),
        });
      }

      return ResponseAdapter.error(json, res.status);
    }

    return ResponseAdapter.success<T>(json);
  } catch (error) {
    if (isTimeoutAbortError(error, signal)) {
      dispatchApiRequestFailed({ status: 408, code: 'REQUEST_TIMEOUT', message: 'REQUEST_TIMEOUT' });
      return ResponseAdapter.error({ error: { code: 'REQUEST_TIMEOUT', message: 'REQUEST_TIMEOUT' } }, 408);
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    dispatchApiRequestFailed({ status: 503, code: 'NETWORK_ERROR', message: 'NETWORK_ERROR' });
    return ResponseAdapter.error({ error: { code: 'NETWORK_ERROR', message: 'NETWORK_ERROR' } }, 503);
  }
}

export async function clientFetcherOrThrow<T>(
  endpoint: string,
  options?: RequestInit,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  const res = await clientFetcher<T>(endpoint, options, params, signal);
  if (res.error) {
    const { AppError } = await import('@/shared/lib/error');
    throw new AppError(String(res.error.code ?? 'API_REQUEST_FAILED'), res.error.message, res.error.details);
  }
  return res.data!;
}
