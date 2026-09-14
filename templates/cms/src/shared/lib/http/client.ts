import { clientFetcher } from './client.fetcher';
import { unwrapApiResponse } from './contract';
import type { ApiResponse, QueryParams } from './types';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  query: QueryParams = {},
  signal?: AbortSignal,
): Promise<ApiResponse<T>> {
  return clientFetcher<T>(endpoint, options, query, signal);
}

export { unwrapApiResponse };
