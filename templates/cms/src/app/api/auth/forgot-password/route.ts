import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@/features/auth';
import { AUTH_ENDPOINTS } from '@/features/auth/services/auth.endpoints';
import { errorHandler } from '@/shared/lib/error-handler';
import { serverFetcher } from '@/shared/lib/http/server.fetcher';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { FORGOT_PASSWORD_SCHEMA, inputValidator } from '@/shared/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

function isNetworkError(code: string | number | undefined): boolean {
  return code === 'NETWORK_ERROR' || code === 503;
}

function createForgotPasswordResponse() {
  return NextResponse.json(
    {
      message: 'If the email exists, a password reset link has been sent.',
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/forgot-password';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.forgotPassword);

    const body = await request.json();
    const validated = inputValidator.validate<ForgotPasswordRequest>(body, FORGOT_PASSWORD_SCHEMA);

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<ForgotPasswordResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(validated),
      cache: 'no-store',
    });

    if (response.error) {
      const duration = Date.now() - startTime;
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'POST',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: isNetworkError(response.error.code) ? 503 : undefined,
          errorCode: isNetworkError(response.error.code)
            ? 'FORGOT_PASSWORD_UPSTREAM_UNAVAILABLE'
            : 'FORGOT_PASSWORD_UPSTREAM_FAILED',
        },
        new Error(response.error.message || 'Forgot password upstream failed'),
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

    return createForgotPasswordResponse();
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

    return createForgotPasswordResponse();
  }
}
