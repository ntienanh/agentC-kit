import type { CmsUser } from '@/features/auth';
import { cookieManager } from '@/shared/lib/cookie-manager';
import { errorHandler } from '@/shared/lib/error-handler';
import { AUTH_ERROR_CODES } from '@/shared/lib/error/error-codes';
import { serverFetcher } from '@/shared/lib/http/server.fetcher';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { NextRequest, NextResponse } from 'next/server';

function getErrorStatus(code: string | number | undefined, fallback: number): number {
  return typeof code === 'number' ? code : fallback;
}

function isNetworkError(code: string | number | undefined): boolean {
  return code === 'NETWORK_ERROR' || code === 503;
}

function buildUpstreamUnavailableResponse(code: string, message: string, upstreamEndpoint: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        upstreamEndpoint,
        suggestedAction: 'Start or restart be_nestjs, then retry the profile request.',
      },
    },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/profile';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.default);

    const accessToken = cookieManager.getAccessToken(request);

    if (!accessToken) {
      return errorHandler.unauthorizedError(endpoint, AUTH_ERROR_CODES.TOKEN_MISSING);
    }

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<CmsUser>('/users/me?populate=role.permissions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.error) {
      const duration = Date.now() - startTime;
      const upstreamUnavailable = isNetworkError(response.error.code);
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'GET',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: upstreamUnavailable ? 503 : getErrorStatus(response.error.code, 401),
          errorCode: upstreamUnavailable ? 'AUTH_GET_PROFILE_UPSTREAM_UNAVAILABLE' : 'AUTH_GET_PROFILE_FAILED',
        },
        new Error(response.error.message || 'Get profile failed'),
      );

      if (upstreamUnavailable) {
        return buildUpstreamUnavailableResponse(
          'AUTH_GET_PROFILE_UPSTREAM_UNAVAILABLE',
          'Profile service is unavailable. Please ensure the backend is running on port 4000.',
          '/users/me?populate=role.permissions',
        );
      }

      return errorHandler.handle(response.error, endpoint);
    }

    if (!response.data?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_GET_PROFILE_INVALID_UPSTREAM_PAYLOAD',
            message: 'Invalid profile response from upstream service.',
            upstreamEndpoint: '/users/me?populate=role.permissions',
          },
        },
        { status: 502 },
      );
    }

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'GET',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
      userId: response.data.id.toString(),
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      requestLogger.logRateLimit(clientIp, endpoint);
      return errorHandler.rateLimitError(endpoint);
    }

    const duration = Date.now() - startTime;
    requestLogger.logError(
      {
        timestamp: new Date().toISOString(),
        endpoint,
        method: 'GET',
        clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
        duration,
        errorCode: 'UNKNOWN_ERROR',
      },
      error instanceof Error ? error : new Error(String(error)),
    );

    return errorHandler.handle(error, endpoint);
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/profile';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.default);

    const accessToken = cookieManager.getAccessToken(request);

    if (!accessToken) {
      return errorHandler.unauthorizedError(endpoint, AUTH_ERROR_CODES.TOKEN_MISSING);
    }

    const body = await request.json();

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<CmsUser>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.error) {
      const duration = Date.now() - startTime;
      const upstreamUnavailable = isNetworkError(response.error.code);
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'PUT',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: upstreamUnavailable ? 503 : getErrorStatus(response.error.code, 400),
          errorCode: upstreamUnavailable ? 'AUTH_UPDATE_PROFILE_UPSTREAM_UNAVAILABLE' : 'AUTH_UPDATE_PROFILE_FAILED',
        },
        new Error(response.error.message || 'Update profile failed'),
      );

      if (upstreamUnavailable) {
        return buildUpstreamUnavailableResponse(
          'AUTH_UPDATE_PROFILE_UPSTREAM_UNAVAILABLE',
          'Profile update service is unavailable. Please ensure the backend is running on port 4000.',
          '/users/me',
        );
      }

      return errorHandler.handle(response.error, endpoint);
    }

    if (!response.data?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_UPDATE_PROFILE_INVALID_UPSTREAM_PAYLOAD',
            message: 'Invalid updated profile response from upstream service.',
            upstreamEndpoint: '/users/me',
          },
        },
        { status: 502 },
      );
    }

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'PUT',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
      userId: response.data.id.toString(),
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      requestLogger.logRateLimit(clientIp, endpoint);
      return errorHandler.rateLimitError(endpoint);
    }

    const duration = Date.now() - startTime;
    requestLogger.logError(
      {
        timestamp: new Date().toISOString(),
        endpoint,
        method: 'PUT',
        clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
        duration,
        errorCode: 'UNKNOWN_ERROR',
      },
      error instanceof Error ? error : new Error(String(error)),
    );

    return errorHandler.handle(error, endpoint);
  }
}
