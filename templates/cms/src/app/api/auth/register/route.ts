import type { RegisterRequest } from '@/features/auth';
import { errorHandler } from '@/shared/lib/error-handler';
import { serverFetcher } from '@/shared/lib/http/server.fetcher';
import { RATE_LIMITS, rateLimiter } from '@/shared/lib/rate-limiter';
import { requestLogger } from '@/shared/lib/request-logger';
import { inputValidator, REGISTER_SCHEMA } from '@/shared/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

function getErrorStatus(code: string | number | undefined, fallback: number): number {
  return typeof code === 'number' ? code : fallback;
}

interface BeRegisterResponse {
  message: string;
  key?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const endpoint = '/api/auth/register';

  try {
    await rateLimiter.check(request, endpoint, RATE_LIMITS.register);

    const body = await request.json();
    const validated = inputValidator.validate<RegisterRequest>(body, REGISTER_SCHEMA);

    requestLogger.logRequest(request, endpoint);

    const response = await serverFetcher<BeRegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: validated.email, password: validated.password }),
      cache: 'no-store',
    });

    if (response.error || !response.data) {
      const duration = Date.now() - startTime;
      requestLogger.logError(
        {
          timestamp: new Date().toISOString(),
          endpoint,
          method: 'POST',
          clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
          duration,
          status: getErrorStatus(response.error?.code, 500),
          errorCode: 'AUTH_REGISTER_FAILED',
        },
        new Error(response.error?.message || 'Register failed'),
      );

      return errorHandler.handle(response.error, endpoint);
    }

    const duration = Date.now() - startTime;
    requestLogger.logSuccess({
      timestamp: new Date().toISOString(),
      endpoint,
      method: 'POST',
      clientIp: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
      duration,
      status: 201,
    });

    return NextResponse.json(response.data, { status: 201 });
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
