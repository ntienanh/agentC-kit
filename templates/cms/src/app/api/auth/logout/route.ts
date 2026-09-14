import { cookieManager } from '@/shared/lib/cookie-manager';
import { errorHandler } from '@/shared/lib/error-handler';
import { serverFetcher } from '@/shared/lib/http/server.fetcher';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { NextRequest, NextResponse } from 'next/server';

function isNetworkError(code: string | number | undefined): boolean {
  return code === 'NETWORK_ERROR' || code === 503;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/logout';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.default);

    requestLogger.logRequest(request, endpoint);

    const accessToken = cookieManager.getAccessToken(request);
    const refreshToken = cookieManager.getRefreshToken(request);

    if (accessToken && refreshToken) {
      void serverFetcher('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      })
        .then(response => {
          if (response.error) {
            console.warn('[AuthLogoutRoute] Upstream logout revoke failed', {
              endpoint,
              upstreamEndpoint: '/auth/logout',
              status: isNetworkError(response.error.code) ? 503 : response.error.code,
              errorCode: isNetworkError(response.error.code)
                ? 'AUTH_LOGOUT_UPSTREAM_UNAVAILABLE'
                : 'AUTH_LOGOUT_REVOKE_FAILED',
              message: response.error.message,
            });
            return;
          }

          console.info('[AuthLogoutRoute] Upstream logout revoke succeeded', {
            endpoint,
            upstreamEndpoint: '/auth/logout',
          });
        })
        .catch(error => {
          console.warn('[AuthLogoutRoute] Upstream logout revoke threw unexpectedly', {
            endpoint,
            upstreamEndpoint: '/auth/logout',
            errorCode: 'AUTH_LOGOUT_REVOKE_UNEXPECTED_ERROR',
            message: error instanceof Error ? error.message : String(error),
          });
        });
    }

    const cookies = cookieManager.clearAuthCookies();

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'POST',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
    });

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie));
    return response;
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
