import { SESSION_TIMING } from '@/configs/core/session.config';
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

interface BeTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  accessibleStoreIds?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/refresh';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.default);

    const refreshToken = cookieManager.getRefreshToken(request);

    if (!refreshToken) {
      return errorHandler.unauthorizedError(endpoint, AUTH_ERROR_CODES.TOKEN_MISSING);
    }

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<BeTokenResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (response.error) {
      const duration = Date.now() - startTime;
      const upstreamUnavailable = isNetworkError(response.error.code);
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'POST',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: upstreamUnavailable ? 503 : getErrorStatus(response.error.code, 401),
          errorCode: upstreamUnavailable ? 'REFRESH_UPSTREAM_UNAVAILABLE' : AUTH_ERROR_CODES.TOKEN_EXPIRED,
        },
        new Error(response.error?.message || 'Token refresh failed'),
      );

      if (upstreamUnavailable) {
        return NextResponse.json(
          {
            error: {
              code: 'REFRESH_UPSTREAM_UNAVAILABLE',
              message: 'Refresh service is unavailable. Please ensure the backend is running on port 4000.',
              upstreamEndpoint: '/auth/refresh-token',
              suggestedAction:
                'Start or restart be_nestjs, then retry. Existing session cookies were not cleared by this response.',
            },
          },
          { status: 503 },
        );
      }

      return errorHandler.unauthorizedError(endpoint, AUTH_ERROR_CODES.TOKEN_EXPIRED);
    }

    if (!response.data?.access_token || !response.data?.refresh_token) {
      const duration = Date.now() - startTime;
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'POST',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: 502,
          errorCode: 'REFRESH_INVALID_UPSTREAM_PAYLOAD',
        },
        new Error('Invalid refresh response from upstream service'),
      );

      return NextResponse.json(
        {
          error: {
            code: 'REFRESH_INVALID_UPSTREAM_PAYLOAD',
            message: 'Invalid refresh response from upstream service.',
            upstreamEndpoint: '/auth/refresh-token',
          },
        },
        { status: 502 },
      );
    }

    const cookies = cookieManager.setAuthCookies(response.data.access_token, response.data.refresh_token);

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'POST',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
    });

    const nextResponse = NextResponse.json(
      {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in ?? SESSION_TIMING.DEFAULT_EXPIRES_IN_SEC,
      },
      { status: 200 },
    );
    cookies.forEach(cookie => nextResponse.headers.append('Set-Cookie', cookie));
    return nextResponse;
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
        method: 'POST',
        clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
        duration,
        errorCode: 'UNKNOWN_ERROR',
      },
      error instanceof Error ? error : new Error(String(error)),
    );

    return errorHandler.handle(error, endpoint);
  }
}
