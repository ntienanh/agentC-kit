import type { ResetPasswordRequest, ResetPasswordResponse } from '@/features/auth';
import { errorHandler } from '@/shared/lib/error-handler';
import { serverFetcher } from '@/shared/lib/http/server.fetcher';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { inputValidator, RESET_PASSWORD_SCHEMA } from '@/shared/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

function getErrorStatus(code: string | number | undefined, fallback: number): number {
  return typeof code === 'number' ? code : fallback;
}

function isNetworkError(code: string | number | undefined): boolean {
  return code === 'NETWORK_ERROR' || code === 503;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/reset-password';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.resetPassword);

    const body = await request.json();
    const validated = inputValidator.validate<ResetPasswordRequest>(body, RESET_PASSWORD_SCHEMA);

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: validated.token,
        newPassword: validated.newPassword,
      }),
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
          status: upstreamUnavailable ? 503 : getErrorStatus(response.error.code, 400),
          errorCode: upstreamUnavailable ? 'AUTH_RESET_PASSWORD_UPSTREAM_UNAVAILABLE' : 'AUTH_RESET_PASSWORD_FAILED',
        },
        new Error(response.error.message || 'Reset password failed'),
      );

      if (upstreamUnavailable) {
        return NextResponse.json(
          {
            error: {
              code: 'AUTH_RESET_PASSWORD_UPSTREAM_UNAVAILABLE',
              message: 'Reset password service is unavailable. Please ensure the backend is running on port 4000.',
              upstreamEndpoint: '/auth/reset-password',
              suggestedAction: 'Start or restart be_nestjs, then retry reset password.',
            },
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: {
            code: typeof response.error.code === 'string' ? response.error.code : 'AUTH_RESET_PASSWORD_FAILED',
            message: response.error.message || 'Reset password failed',
          },
          timestamp: new Date().toISOString(),
          path: endpoint,
        },
        { status: getErrorStatus(response.error.code, 400) },
      );
    }

    if (!response.data) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_RESET_PASSWORD_INVALID_UPSTREAM_PAYLOAD',
            message: 'Invalid reset password response from upstream service.',
            upstreamEndpoint: '/auth/reset-password',
          },
        },
        { status: 502 },
      );
    }

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'POST',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 200,
    });

    return NextResponse.json(
      {
        message: 'Password reset successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      requestLogger.logRateLimit(clientIp, endpoint);
      return errorHandler.rateLimitError(endpoint);
    }

    if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
      return errorHandler.validationError(error.message.replace('VALIDATION_ERROR: ', ''), endpoint);
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
