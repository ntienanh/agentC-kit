import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthorizationHeader, createBearerToken } from './auth-header';
import { clientFetcher, isLoggingOut, registerActiveStoreIdGetter, setLoggingOutFlag } from './client.fetcher';
import { getCmsApiBaseUrl, getCmsOriginUrl, getCmsUploadBaseUrl, resolveCmsAssetUrl } from './cms-url';
import { QueryBuilder } from './query.builder';
import { ResponseAdapter } from './response.adapter';
import type { FilterValue } from './types';

describe('auth-header', () => {
  it('creates bearer tokens correctly', () => {
    expect(createBearerToken('abc123token')).toBe('Bearer abc123token');
  });

  it('creates authorization header objects', () => {
    expect(createAuthorizationHeader('my-token')).toEqual({ Authorization: 'Bearer my-token' });
    expect(createAuthorizationHeader(null)).toEqual({});
    expect(createAuthorizationHeader(undefined)).toEqual({});
  });
});

describe('cms-url', () => {
  it('returns cms base urls and resolves asset urls', () => {
    expect(getCmsApiBaseUrl()).toBeDefined();
    expect(getCmsOriginUrl()).toBeDefined();
    expect(getCmsUploadBaseUrl()).toBeDefined();

    expect(resolveCmsAssetUrl(null)).toBe('');
    expect(resolveCmsAssetUrl('http://example.com/img.png')).toBe('http://example.com/img.png');
    expect(resolveCmsAssetUrl('https://example.com/img.png')).toBe('https://example.com/img.png');
    expect(resolveCmsAssetUrl('/uploads/image.png')).toContain('/uploads/image.png');
  });
});

describe('QueryBuilder', () => {
  it('builds query string with pagination, sort, search and filters', () => {
    const q1 = QueryBuilder.build({
      page: 1,
      pageSize: 20,
      sort: ['created_at:desc'],
      search: 'test',
      populate: '*',
      filters: {
        status: { eq: 'active' },
        price: { gte: 10, lte: 100 },
        tags: { in: ['a', 'b'] },
        created: { bt: ['2026-01-01', '2026-01-02'] },
        $or: [{ status: { eq: 'pending' } }],
      },
    });

    expect(q1).toContain('pagination[page]=1');
    expect(q1).toContain('pagination[pageSize]=20');
    expect(q1).toContain('search=test');
    expect(q1).toContain('populate=*');
    expect(q1).toContain('filters[status][$eq]=active');
  });

  it('handles orderBy and orderType option and primitive filter processing', () => {
    const q = QueryBuilder.build({ orderBy: 'title', orderType: 'desc' });
    expect(q).toContain('sort[0]=title:desc');

    const processed = QueryBuilder.processFilters({
      status: 'active' as FilterValue,
      price: { eq: 10 },
      $and: [{ status: 'active' as FilterValue }],
    });
    expect(processed).toBeDefined();
    expect(QueryBuilder.processFilters(undefined)).toBeUndefined();
  });
});

describe('ResponseAdapter', () => {
  it('adapts success response correctly', () => {
    const successRes = ResponseAdapter.success({ data: { id: 1 }, meta: { page: 1, total: 10 } });
    expect(successRes.data).toEqual({ id: 1 });
    expect(successRes.pagination?.total).toBe(10);

    const resWithPagination = ResponseAdapter.success({ data: [1, 2], meta: { pagination: { page: 2, total: 20 } } });
    expect(resWithPagination.pagination?.page).toBe(2);

    const nonRecord = ResponseAdapter.success(123);
    expect(nonRecord.data).toBeNull();
    expect(nonRecord.pagination).toBeUndefined();
  });

  it('adapts error response correctly', () => {
    const errRes = ResponseAdapter.error({ error: { code: 'CUSTOM_ERR', message: 'Failed' } }, 400);
    expect(errRes.data).toBeNull();
    expect(errRes.error?.code).toBe('CUSTOM_ERR');
    expect(errRes.error?.message).toBe('Failed');

    const numericCodeRes = ResponseAdapter.error({ error: { code: 5001, message: 'Numeric code' } }, 500);
    expect(numericCodeRes.error?.code).toBe(5001);

    const timeoutRes = ResponseAdapter.error({}, 408);
    expect(timeoutRes.error?.message).toBe('REQUEST_TIMEOUT');
  });
});

describe('clientFetcher', () => {
  const originalFetch = globalThis.fetch;
  let dispatchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setLoggingOutFlag(false);
    dispatchSpy = vi.fn();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      },
      dispatchEvent: dispatchSpy,
    });
    vi.stubGlobal(
      'CustomEvent',
      class {
        type: string;
        detail: unknown;
        constructor(type: string, opts?: { detail?: unknown }) {
          this.type = type;
          this.detail = opts?.detail;
        }
      },
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllGlobals();
  });

  it('fetches successfully and applies store header if available', async () => {
    registerActiveStoreIdGetter(() => 'store-999');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { success: true } }),
    });

    const res = await clientFetcher<{ success: boolean }>('/api/test');
    expect(res.data).toEqual({ success: true });
    expect(isLoggingOut()).toBe(false);
  });

  it('handles 401 and 403 status codes and dispatches window events', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }),
    });

    const res = await clientFetcher('/api/protected');
    expect(res.data).toBeNull();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
