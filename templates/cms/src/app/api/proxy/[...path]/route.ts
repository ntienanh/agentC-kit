const apiFetch = fetch;
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/configs/core/session.config';
import { setAuthCookies } from '@/shared/lib/cookies.server';
import { isSecureEnvironment } from '@/shared/lib/cookies.util';
import { getCmsApiBaseUrl } from '@/shared/lib/http';
import { createAuthorizationHeader } from '@/shared/lib/http/auth-header';
import { refreshTokenWithLock } from '@/shared/lib/refresh-lock.server';
import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function forwardRequest(
  request: NextRequest,
  targetUrl: string,
  token: string | undefined,
  body: BodyInit | null,
) {
  const originalContentType = request.headers.get('content-type');
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (originalContentType) {
    headers['Content-Type'] = originalContentType;
  } else if (request.method !== 'GET' && request.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  Object.assign(headers, createAuthorizationHeader(token));

  const requestStoreId = request.headers.get('x-store-id');
  if (requestStoreId) headers['X-Store-ID'] = requestStoreId;

  const requestTenantId = request.headers.get('x-tenant-id');
  if (requestTenantId) headers['X-Tenant-ID'] = requestTenantId;

  try {
    return await apiFetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          status: 503,
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Backend upstream service is currently unavailable.',
          timestamp: dayjs().toISOString(),
        },
      },
      { status: 503 },
    );
  }
}

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some(segment => segment.includes('..') || segment.includes('\\'))) {
    return NextResponse.json({ error: { code: 'INVALID_PROXY_PATH', message: 'Path traversal detected' } }, { status: 400 });
  }

  const endpoint = `/${path.join('/')}`;
  const targetUrl = `${getCmsApiBaseUrl()}${endpoint}${request.nextUrl.search}`;
  const cookieStore = await cookies();
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
  const token = cookieStore.get(ACCESS_TOKEN)?.value || headerToken;
  const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value;

  const body = request.method === 'GET' || request.method === 'HEAD' ? null : await request.arrayBuffer();
  let response = await forwardRequest(request, targetUrl, token, body);

  if (response.status === 401 && refreshToken) {
    let responseBody: Record<string, unknown> = {};
    try {
      responseBody = await response.clone().json();
    } catch {
      responseBody = {};
    }

    const errorPayload = responseBody.error as Record<string, unknown> | undefined;
    const errorCode = errorPayload?.code ?? responseBody.code;
    const errorMessage = errorPayload?.message ?? responseBody.message ?? '';

    if (
      errorCode === 'permissions_changed' ||
      String(errorMessage).includes('permissions_changed') ||
      String(errorMessage).includes('Role permissions have changed')
    ) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: 401 });
    }

    const tokens = await refreshTokenWithLock(refreshToken);
    if (tokens) {
      response = await forwardRequest(request, targetUrl, tokens.accessToken, body);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const refreshedResponse = NextResponse.json(data, { status: response.status });
        setAuthCookies(
          refreshedResponse,
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          },
          isSecureEnvironment(),
        );
        return refreshedResponse;
      }
    }
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
