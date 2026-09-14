import {
  AUTH_ERROR_CODES,
  HTTP_ERROR_CODES,
  VALIDATION_ERROR_CODES,
  type ErrorCode,
} from '@/shared/lib/error/error-codes';
import { NextResponse } from 'next/server';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      field?: string;
      constraint?: string;
    };
  };
  timestamp: string;
  path: string;
}

interface CmsError {
  message?: string;
  error?: {
    message?: string;
    details?: unknown;
  };
  statusCode?: number;
}

const CMS_ERROR_MAP: Record<string, { code: ErrorCode; status: number }> = {
  'Invalid identifier or password': {
    code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    status: 401,
  },
  'Invalid credentials': {
    code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    status: 401,
  },
  account_deleted: {
    code: AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    status: 403,
  },
  'Your account has been blocked': {
    code: AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    status: 403,
  },
  'Email is already taken': {
    code: VALIDATION_ERROR_CODES.DUPLICATE,
    status: 409,
  },
  'Username is already taken': {
    code: VALIDATION_ERROR_CODES.DUPLICATE,
    status: 409,
  },
  'Token expired': {
    code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
    status: 401,
  },
  'Invalid token': {
    code: AUTH_ERROR_CODES.TOKEN_INVALID,
    status: 401,
  },
  'Token not found': {
    code: AUTH_ERROR_CODES.TOKEN_MISSING,
    status: 401,
  },
};

export class ErrorHandler {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private extractCmsErrorMessage(error: CmsError): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error';
  }

  mapCmsError(error: CmsError): { code: ErrorCode; status: number; message: string } {
    const errorMessage = this.extractCmsErrorMessage(error);

    for (const [cmsMessage, mapping] of Object.entries(CMS_ERROR_MAP)) {
      if (errorMessage.includes(cmsMessage)) {
        return {
          code: mapping.code,
          status: mapping.status,
          message: 'Invalid credentials',
        };
      }
    }

    return {
      code: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
      status: error.statusCode || 500,
      message: 'An error occurred',
    };
  }

  sanitizeError(error: Error): { code: ErrorCode; message: string } {
    const errorMessage = error.message;

    if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
      return {
        code: HTTP_ERROR_CODES.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
      };
    }

    if (errorMessage.includes('VALIDATION_ERROR')) {
      return {
        code: VALIDATION_ERROR_CODES.ERROR,
        message: errorMessage.replace('VALIDATION_ERROR: ', ''),
      };
    }

    if (errorMessage.includes('AUTH_')) {
      return {
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      };
    }

    return {
      code: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: this.isProduction ? 'An unexpected error occurred' : errorMessage,
    };
  }

  private createErrorResponse(
    code: string,
    message: string,
    path: string,
    details?: { field?: string; constraint?: string },
  ): ErrorResponse {
    return {
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  handle(error: unknown, path: string): NextResponse<ErrorResponse> {
    if (typeof error === 'object' && error !== null) {
      const cmsError = error as CmsError;
      if (cmsError.message || cmsError.error) {
        const mapped = this.mapCmsError(cmsError);
        const response = this.createErrorResponse(mapped.code, mapped.message, path);
        return NextResponse.json(response, { status: mapped.status });
      }
    }

    if (error instanceof Error) {
      const sanitized = this.sanitizeError(error);
      const status =
        sanitized.code === HTTP_ERROR_CODES.TOO_MANY_REQUESTS
          ? 429
          : sanitized.code.startsWith('VALIDATION_')
            ? 400
            : sanitized.code.startsWith('AUTH_')
              ? 401
              : 500;

      const response = this.createErrorResponse(sanitized.code, sanitized.message, path);
      return NextResponse.json(response, { status });
    }

    const response = this.createErrorResponse(
      HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
      this.isProduction ? 'An unexpected error occurred' : String(error),
      path,
    );
    return NextResponse.json(response, { status: 500 });
  }

  validationError(message: string, path: string, field?: string): NextResponse<ErrorResponse> {
    const response = this.createErrorResponse(
      VALIDATION_ERROR_CODES.ERROR,
      message,
      path,
      field ? { field } : undefined,
    );
    return NextResponse.json(response, { status: 400 });
  }

  rateLimitError(path: string): NextResponse<ErrorResponse> {
    const response = this.createErrorResponse(
      HTTP_ERROR_CODES.TOO_MANY_REQUESTS,
      'Too many requests. Please try again later.',
      path,
    );
    return NextResponse.json(response, { status: 429 });
  }

  unauthorizedError(path: string, code: ErrorCode = AUTH_ERROR_CODES.TOKEN_MISSING): NextResponse<ErrorResponse> {
    const response = this.createErrorResponse(code, 'Unauthorized', path);
    return NextResponse.json(response, { status: 401 });
  }

  forbiddenError(path: string): NextResponse<ErrorResponse> {
    const response = this.createErrorResponse(HTTP_ERROR_CODES.FORBIDDEN, 'Forbidden', path);
    return NextResponse.json(response, { status: 403 });
  }
}

export const errorHandler = new ErrorHandler();
