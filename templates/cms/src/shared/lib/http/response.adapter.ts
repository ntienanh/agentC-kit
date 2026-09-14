import type { ApiResponse } from './types';

type ApiRecord = Record<string, unknown>;
type ApiPagination = ApiResponse<unknown>['pagination'];

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toErrorCode(value: unknown, fallback: number): string | number {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}

function readPagination(meta: unknown): ApiPagination {
  if (!isRecord(meta)) return undefined;

  const source = isRecord(meta.pagination) ? meta.pagination : meta;
  return {
    page: toNumber(source.page, 1),
    pageSize: toNumber(source.pageSize ?? source.limit, 20),
    total: toNumber(source.total, 0),
    pageCount: toNumber(source.pageCount ?? source.totalPages, 0),
  };
}

export const ResponseAdapter = {
  success<T>(res: unknown): ApiResponse<T> {
    const data = isRecord(res) && 'data' in res ? ((res.data as T | null | undefined) ?? null) : null;
    const pagination = isRecord(res) ? readPagination(res.meta ?? res.pagination) : undefined;

    return {
      data,
      pagination,
    };
  },

  error(res: unknown, status: number): ApiResponse<never> {
    const err = isRecord(res) && isRecord(res.error) ? res.error : {};
    const fallbackMessage = status === 408 ? 'REQUEST_TIMEOUT' : 'UNKNOWN_ERROR';

    return {
      data: null,
      error: {
        code: toErrorCode(err.code ?? err.status, status),
        message: typeof err.message === 'string' ? err.message : fallbackMessage,
        details: err.details,
      },
    };
  },
};
