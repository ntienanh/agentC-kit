import { getCmsApiBaseUrl } from '@/shared/lib/http';
import { ResponseAdapter } from './response.adapter';
import type { ApiResponse } from './types';

export async function serverFetcher<T>(
  endpoint: string,
  options: RequestInit & { tags?: string[] } = {},
): Promise<ApiResponse<T>> {
  try {
    const { tags, ...fetchOptions } = options;

    const targetUrl = `${getCmsApiBaseUrl()}${endpoint}`;

    const res = await fetch(targetUrl, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(fetchOptions.headers as Record<string, string> | undefined),
      },
      ...(tags
        ? {
            next: {
              tags,
              ...(fetchOptions.next || {}),
            },
          }
        : {}),
    });

    let json: Record<string, unknown> = {};
    try {
      json = await res.json();
    } catch {
      json = {};
    }

    if (!res.ok) {
      return ResponseAdapter.error(json, res.status);
    }

    return ResponseAdapter.success<T>(json);
  } catch {
    return ResponseAdapter.error({ error: { code: 'NETWORK_ERROR', message: 'NETWORK_ERROR' } }, 503);
  }
}
