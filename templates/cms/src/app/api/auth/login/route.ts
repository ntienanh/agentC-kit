const apiFetch = fetch;
import type { LoginRequest, LoginResponse } from '@/features/auth';
import { cookieManager } from '@/shared/lib/cookie-manager';
import { errorHandler } from '@/shared/lib/error-handler';
import { getCmsApiBaseUrl } from '@/shared/lib/http';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { inputValidator, LOGIN_SCHEMA } from '@/shared/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

function extractLoginResponse(json: unknown): LoginResponse | null {
  if (typeof json !== 'object' || json === null) {
    return null;
  }
  const envelope = json as Record<string, unknown>;
  const rawData =
    typeof envelope.data === 'object' && envelope.data !== null
      ? (envelope.data as Record<string, unknown>)
      : envelope;

  const accessToken =
    typeof rawData.accessToken === 'string'
      ? rawData.accessToken
      : typeof rawData.jwt === 'string'
        ? rawData.jwt
        : '';
  const refreshToken = typeof rawData.refreshToken === 'string' ? rawData.refreshToken : '';
  const user = typeof rawData.user === 'object' && rawData.user !== null ? (rawData.user as Record<string, unknown>) : null;
  const userId = user?.id;

  if (!accessToken || !refreshToken || (userId !== 0 && !userId)) {
    return null;
  }

  return {
    ...rawData,
    accessToken,
    jwt: accessToken,
    refreshToken,
    user: user as unknown as LoginResponse['user'],
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/login';
  const upstreamUrl = `${getCmsApiBaseUrl()}/api/v1/auth/login`;

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.login);

    const body = await request.json();
    const validated = inputValidator.validate<LoginRequest>(body, LOGIN_SCHEMA);

    const loginPayload = {
      email: validated.email || validated.identifier,
      password: validated.password,
    };

    requestLogger.logRequest(request, endpoint);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let beRes: Response;
    try {
      beRes = await apiFetch(upstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(loginPayload),
        cache: 'no-store',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const json = await beRes.json().catch(() => ({}));

    if (!beRes.ok) {
      const duration = Date.now() - startTime;
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'POST',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: beRes.status,
          errorCode: 'AUTH_LOGIN_FAILED',
        },
        new Error(json.error?.message || 'Login failed'),
      );
      return errorHandler.handle(json, endpoint);
    }

    const data = extractLoginResponse(json);

    if (!data) {
      return errorHandler.handle(
        {
          error: {
            status: 502,
            message: 'Invalid login response from upstream service',
            details: process.env.NODE_ENV === 'development' ? { upstreamUrl, payload: json } : undefined,
          },
        },
        endpoint,
      );
    }

    const cookies = cookieManager.setAuthCookies(data.accessToken, data.refreshToken);

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'POST',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
      userId: String(data.user.id),
    });
    console.info('[AuthLoginRoute] Upstream login success', {
      upstreamUrl,
      durationMs: Date.now() - startTime,
      userId: data.user.id,
    });

    const response = NextResponse.json(data, { status: 200 });
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      requestLogger.logRateLimit(clientIp, endpoint);
      return errorHandler.rateLimitError(endpoint);
    }

    if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
      return errorHandler.validationError(error.message.replace('VALIDATION_ERROR: ', ''), endpoint);
    }

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[AuthLoginRoute] Upstream login timeout', {
        upstreamUrl,
        durationMs: Date.now() - startTime,
      });
      return errorHandler.handle(
        {
          error: {
            status: 504,
            message: 'Login upstream timeout. Please check backend, database, and Redis health.',
            details: { upstream: upstreamUrl },
          },
        },
        endpoint,
      );
    }

    const duration = Date.now() - startTime;
    const errorCause = error instanceof Error && 'cause' in error ? error.cause : undefined;
    const isFetchFailure = error instanceof TypeError && error.message === 'fetch failed';
    requestLogger.logError(
      {
        timestamp: new Date().toISOString(),
        endpoint,
        method: 'POST',
        clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
        duration,
        errorCode: isFetchFailure ? 'LOGIN_UPSTREAM_UNAVAILABLE' : 'UNKNOWN_ERROR',
      },
      error instanceof Error ? error : new Error(String(error)),
    );

    console.error('[AuthLoginRoute] Unexpected login route error', {
      upstreamUrl,
      cmsBaseUrl: getCmsApiBaseUrl(),
      errorName: error instanceof Error ? error.name : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      cause: errorCause,
    });

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: {
            code: 'LOGIN_ROUTE_UNEXPECTED_ERROR',
            message: error instanceof Error ? error.message : String(error),
            upstreamUrl,
            cmsBaseUrl: getCmsApiBaseUrl(),
            cause: errorCause instanceof Error ? errorCause.message : String(errorCause ?? ''),
          },
        },
        { status: 502 },
      );
    }

    return errorHandler.handle(error, endpoint);
  }
}
