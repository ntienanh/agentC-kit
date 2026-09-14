import { AppError, normalizeApiError } from '@/shared/lib/error';
import type { ApiResponse } from './types';

export function unwrapApiResponse<T>(response: ApiResponse<T>, fallbackCode = 'UNKNOWN_ERROR'): T {
  if (response.error) {
    const error = normalizeApiError(response.error, fallbackCode);
    throw new AppError(error.code, error.message, error.details);
  }

  if (response.data === null || response.data === undefined) {
    throw new AppError(fallbackCode);
  }

  return response.data;
}

export function normalizeApiResponseError(error: unknown, fallbackCode = 'UNKNOWN_ERROR'): ApiResponse<never> {
  return {
    data: null,
    error: normalizeApiError(error, fallbackCode),
  };
}
